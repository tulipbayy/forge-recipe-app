import { useState } from "react";

export default function Chatbot({ recipe }) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hi! I'm your recipe assistant. Ask me anything about this dish!" }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const userMessage = { role: "user", content: input };
        const newHistory = [...messages, userMessage];
        
        // Show user's message on screen
        setMessages(newHistory);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:5001/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    history: newHistory,
                    recipe: recipe
                })
            });
            const data = await response.json();
            
            if (data.reply) {
                setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I lost connection to the server!" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-[500px]">

            {/* Header */}
            <div className="bg-slate-800 text-white p-4 rounded-t-lg">
                <h2 className="text-xl font-serif">Recipe Assistant</h2>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === "user" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-800"}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-100 text-slate-500 p-3 rounded-lg text-sm italic">
                            Assistant is thinking...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Questions? Ask!"
                    className="flex-1 p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-700 disabled:opacity-50 transition"
                >
                    Send
                </button>
            </form>
        </div>
    );
}