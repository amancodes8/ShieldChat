import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { auth, db } from "../firebase-config"
import "../styles/Chat.css";
import { generateKeyFromPassword, encryptMessage, decryptMessage } from "../utils/crypto";

export const Chat = (props) => {
    const { room, roomPassword } = props;
    const [newMessage, setNewMessage] = useState("")
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cryptoKey, setCryptoKey] = useState(null);

    const messagesRef = collection(db, "messages");

    // Derive key when room or password changes
    useEffect(() => {
        const initKey = async () => {
            if (roomPassword) {
                try {
                    const key = await generateKeyFromPassword(roomPassword, room);
                    setCryptoKey(key);
                } catch (err) {
                    console.error("Key generation failed:", err);
                    setError("Failed to generate encryption key");
                }
            } else {
                setCryptoKey(null);
            }
        };
        initKey();
    }, [room, roomPassword]);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const queryMessages = query(
            messagesRef,
            where("room", "==", room),
            orderBy("createdAt")
        );

        const unsuscribe = onSnapshot(
            queryMessages,
            (snapshot) => {
                let messages = [];
                const processMessages = async () => {
                    for (const doc of snapshot.docs) {
                        const data = doc.data();
                        let text = data.text;
                        let isEncrypted = false;

                        // Try to decrypt if we have a key and it looks like JSON
                        if (cryptoKey && text.startsWith('{') && text.includes('"iv":')) {
                            const decrypted = await decryptMessage(text, cryptoKey);
                            if (decrypted) {
                                text = decrypted;
                                isEncrypted = true;
                            } else {
                                text = "🔒 Encrypted Message (Wrong Password)";
                            }
                        } else if (text.startsWith('{') && text.includes('"iv":')) {
                            text = "🔒 Encrypted Message (Password Required)";
                        }

                        messages.push({ ...data, id: doc.id, text, isEncrypted });
                    }
                    setMessages(messages);
                    setLoading(false);
                    setError(null);
                };
                processMessages();
            },
            (error) => {
                console.error("Firestore error:", error);
                setError(
                    <div>
                        <p>Index required: {error.message}</p>
                        <a
                            href="https://console.firebase.google.com/project/ishan-saraswat/firestore/indexes"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'blue', textDecoration: 'underline' }}
                        >
                            Click here to create the required index
                        </a>
                        <p style={{ fontSize: '12px', marginTop: '10px' }}>
                            Or wait 2-5 minutes if you already created it
                        </p>
                    </div>
                );
                setLoading(false);
            }
        );

        return () => unsuscribe();
    }, [room, cryptoKey]); // Re-run when key changes to re-decrypt

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedMessage = newMessage.trim();
        if (trimmedMessage === "") {
            setNewMessage("");
            return;
        }

        if (!auth.currentUser) {
            setError("User not authenticated");
            return;
        }

        try {
            let messageText = trimmedMessage;
            if (cryptoKey) {
                messageText = await encryptMessage(trimmedMessage, cryptoKey);
            }

            await addDoc(messagesRef, {
                text: messageText,
                createdAt: serverTimestamp(),
                user: auth.currentUser.displayName || "Anonymous",
                room,
                userId: auth.currentUser.uid // Add user ID for better identification
            });
            setNewMessage("");
            setError(null);
        } catch (error) {
            console.error("Error sending message:", error);
            setError("Failed to send message: " + error.message);
        }
    }

    // Check if message is from current user
    const isCurrentUser = (messageUser) => {
        return auth.currentUser &&
            (messageUser === auth.currentUser.displayName ||
                messageUser === auth.currentUser.email);
    }

    if (loading) {
        return (
            <div className="chat-app">
                <div className="header">
                    <h1>Welcome to: {room.toUpperCase()}</h1>
                </div>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    Loading messages...
                </div>
            </div>
        );
    }

    return (
        <div className="chat-app">
            <div className="header">
                <h1>Welcome to: {room.toUpperCase()}</h1>
            </div>

            {error && (
                <div className="error">
                    {error}
                </div>
            )}

            <div className="messages">
                {messages.length === 0 && !error ? (
                    <div className="no-messages">No messages yet. Start the conversation!</div>
                ) : (
                    messages.map((message) => {
                        const isSender = isCurrentUser(message.user);
                        return (
                            <div
                                key={message.id}
                                className={`message ${isSender ? 'sender' : 'receiver'}`}
                            >
                                <div className="message-content">
                                    {!isSender && (
                                        <span className="user">{message.user}</span>
                                    )}
                                    <span className="text">{message.text}</span>
                                    {message.createdAt && (
                                        <span className="timestamp">
                                            {new Date(message.createdAt.seconds * 1000).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form className="new-message-form" onSubmit={handleSubmit}>
                <input
                    className="new-message-input"
                    placeholder="Type your message here..."
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                    maxLength={500}
                    disabled={!!error}
                />
                <button
                    className="send-button"
                    type="submit"
                    disabled={!newMessage.trim() || !!error}
                >
                    Send
                </button>
            </form>
        </div>
    )
}