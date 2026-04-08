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
            <div className="flex flex-col items-center justify-center h-full w-full bg-transparent">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mb-4 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                <p className="text-indigo-200/50 font-light tracking-widest text-xs uppercase text-center mt-2">Loading secure messages...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-transparent w-full relative">
            {/* Error Message */}
            {error && (
                <div className="absolute top-4 left-4 right-4 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md z-20 flex items-center gap-3">
                    <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="text-xs font-light tracking-wide">{error}</span>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
                {messages.length === 0 && !error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-white/50">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-inner">
                            <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        </div>
                        <p className="font-light tracking-wider text-lg text-white/80 mb-1">No messages yet</p>
                        <p className="text-xs font-light text-white/40">Be the first to start the secure conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isSender = isCurrentUser(message.user);
                        return (
                            <div key={message.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex flex-col max-w-[80%] md:max-w-[70%] ${isSender ? 'items-end' : 'items-start'}`}>
                                    {!isSender && (
                                        <span className="text-[10px] font-medium tracking-wider uppercase text-white/50 ml-2 mb-1.5">{message.user}</span>
                                    )}
                                    <div 
                                        className={`px-4 py-3 rounded-2xl shadow-sm relative group backdrop-blur-md
                                        ${isSender 
                                            ? 'bg-indigo-500/20 text-indigo-100 border border-indigo-400/30 rounded-br-sm'
                                            : 'bg-white/5 text-white/90 border border-white/10 rounded-bl-sm'
                                        }`}
                                    >
                                        <p className="text-[15px] font-light leading-relaxed break-words">{message.text}</p>
                                    </div>
                                    {message.createdAt && (
                                        <span className={`text-[10px] text-white/30 mt-1.5 font-light tracking-wide ${isSender ? 'mr-2' : 'ml-2'}`}>
                                            {new Date(message.createdAt.seconds * 1000).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                            {message.isEncrypted && <span className="ml-1.5 opacity-50 text-[9px]">🔒</span>}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="bg-black/20 border-t border-white/10 p-4 backdrop-blur-xl z-10 w-full shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-3 w-full relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 rounded-2xl py-3.5 px-5 mx-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 focus:bg-black/60 transition-all text-[15px] text-white placeholder-white/30 font-light"
                        placeholder="Type a secure message..."
                        maxLength={500}
                        disabled={!!error}
                    />
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim() || !!error}
                        className="bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 border border-indigo-500/30 rounded-2xl p-3.5 px-6 font-medium tracking-wide flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-1 focus:ring-indigo-400 shrink-0"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};