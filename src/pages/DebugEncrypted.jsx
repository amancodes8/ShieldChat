import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from "../firebase-config"

const DebugEncrypted = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRoom, setFilterRoom] = useState("");

    useEffect(() => {
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef, orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                let iv = "N/A";
                let cipherText = data.text;

                // Try to parse JSON to extract IV and Ciphertext
                if (typeof data.text === 'string' && data.text.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(data.text);
                        if (parsed.iv && parsed.data) {
                            iv = parsed.iv.toString(); // Displaying array as string for now
                            // Convert data array back to base64 or just show raw array string
                            // For better readability, let's try to show a snippet or the array
                            cipherText = JSON.stringify(parsed.data).substring(0, 50) + "...";

                            // Actually, let's show the full raw text as requested, 
                            // but maybe formatted if it's JSON
                            cipherText = data.text;

                            // Let's try to extract IV nicely if possible
                            iv = JSON.stringify(parsed.iv);
                        }
                    } catch (e) {
                        // Not JSON
                    }
                }

                return {
                    id: doc.id,
                    ...data,
                    displayIv: iv,
                    displayCipherText: cipherText
                };
            });
            setMessages(msgs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredMessages = messages.filter(msg =>
        (msg.room || "").toLowerCase().includes(filterRoom.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-mono text-sm">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Encrypted Messages Debug Panel</h1>
                    <p className="text-gray-600">Raw AES-GCM encrypted payloads stored in Firestore.</p>
                </header>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Filter by room..."
                        className="w-full p-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filterRoom}
                        onChange={(e) => setFilterRoom(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <div className="space-y-4">
                        {filteredMessages.map(msg => (
                            <div key={msg.id} className="bg-white p-4 rounded border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="mb-2">
                                            <span className="font-bold text-gray-500">Room:</span> <span className="text-blue-600 font-semibold">{msg.room}</span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="font-bold text-gray-500">UID:</span> {msg.userId || msg.uid || "N/A"}
                                        </div>
                                        <div className="mb-2">
                                            <span className="font-bold text-gray-500">Name:</span> {msg.user}
                                        </div>
                                        <div className="mb-2">
                                            <span className="font-bold text-gray-500">Created At:</span> {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleString() : "Pending..."}
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <div className="mb-2">
                                            <span className="font-bold text-gray-500 block mb-1">cipherText (Raw):</span>
                                            <pre className="bg-gray-50 p-2 rounded border border-gray-200 text-xs break-all whitespace-pre-wrap">
                                                {msg.text}
                                            </pre>
                                        </div>
                                        {/* Optional: Show parsed IV if available, but raw text usually contains it */}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredMessages.length === 0 && (
                            <div className="text-center text-gray-500 py-10">No messages found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DebugEncrypted;
