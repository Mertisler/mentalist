"use client";
import { useState, useRef, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, orderBy, updateDoc, doc, deleteDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { User } from "firebase/auth";

interface Chat {
  id: string;
  title: string;
  createdAt: Date | null;
  isFavorite: boolean;
}

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date | null;
  isFavorite?: boolean;
}

// Kod bloğu ve markdown temizleyici fonksiyon
function cleanMarkdown(text: string) {
  return text
    .replace(/^```[a-zA-Z]*\n?/, '') // baştaki ``` veya ```markdown
    .replace(/```$/, '')              // sondaki ```
    .replace(/^markdown\s*/i, '')    // baştaki 'markdown' kelimesi
    .trim();
}

export default function AiAssistantPage() {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favChatLoading, setFavChatLoading] = useState<string>("");
  const [delChatLoading, setDelChatLoading] = useState<string>("");
  const [favMsgLoading, setFavMsgLoading] = useState<string>("");
  const [delMsgLoading, setDelMsgLoading] = useState<string>("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        await fetchChats(u.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchChats = async (uid: string) => {
    const q = query(collection(db, "chats"), where("userId", "==", uid), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000) : null })) as Chat[];
    setChats(data);
    if (data.length > 0 && !selectedChat) {
      setSelectedChat(data[0]);
    }
  };

  useEffect(() => {
    if (!selectedChat) return;
    const q = query(collection(db, "chats", selectedChat.id, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000) : null })) as Message[];
      setMessages(data);
    });
    return () => unsub();
  }, [selectedChat]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleNewChat = async () => {
    if (!user) return;
    const newChat = await addDoc(collection(db, "chats"), {
      userId: user.uid,
      title: "Yeni Sohbet",
      createdAt: serverTimestamp(),
      isFavorite: false,
    });
    await fetchChats(user.uid);
    setSelectedChat({ id: newChat.id, title: "Yeni Sohbet", createdAt: null, isFavorite: false });
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || !selectedChat) return;
    setLoading(true);
    setError(null);
    try {
      if (selectedChat.title === "Yeni Sohbet") {
        await updateDoc(doc(db, "chats", selectedChat.id), { title: input });
        setSelectedChat({ ...selectedChat, title: input });
        await fetchChats(user.uid);
      }
      await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
        role: "user",
        content: input,
        createdAt: serverTimestamp(),
        isFavorite: false,
      });
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: input }] })
      });
      const data = await res.json();
      const asstContent = data.reply || "Bir hata oluştu.";
      await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
        role: "assistant",
        content: asstContent,
        createdAt: serverTimestamp(),
        isFavorite: false,
      });
      setInput("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "İstek sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleToggleFavoriteChat = async (id: string, current: boolean) => {
    setFavChatLoading(id);
    await updateDoc(doc(db, "chats", id), { isFavorite: !current });
    if (user) await fetchChats(user.uid);
    setFavChatLoading("");
  };
  const handleDeleteChat = async (id: string) => {
    setDelChatLoading(id);
    await deleteDoc(doc(db, "chats", id));
    if (user) await fetchChats(user.uid);
    if (selectedChat?.id === id) setSelectedChat(null);
    setDelChatLoading("");
  };

  const handleToggleFavoriteMsg = async (id: string, current: boolean) => {
    setFavMsgLoading(id);
    await updateDoc(doc(db, "chats", selectedChat!.id, "messages", id), { isFavorite: !current });
    setFavMsgLoading("");
  };
  const handleDeleteMsg = async (id: string) => {
    setDelMsgLoading(id);
    await deleteDoc(doc(db, "chats", selectedChat!.id, "messages", id));
    setDelMsgLoading("");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-row items-start py-10 px-2 bg-gradient-to-br from-yellow-100 via-white to-indigo-100 relative overflow-hidden">
      {/* Hafif desenli arka plan */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg width="100%" height="100%" className="opacity-10 blur-sm">
          <defs>
            <radialGradient id="bg1" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="100%" stopColor="#c7d2fe" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg1)" />
        </svg>
      </div>
      {/* Sidebar */}
      <div className="w-80 bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl p-5 mr-8 flex flex-col gap-4 h-[70vh] min-h-[400px] z-10 border border-yellow-100">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Sohbetler</h2>
          <button onClick={handleNewChat} className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-300 text-white rounded-lg shadow hover:scale-105 hover:from-yellow-500 transition-all text-base font-semibold">+ Yeni</button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 custom-scrollbar">
          {chats.map(chat => (
            <div key={chat.id} className={`flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer transition-all shadow-sm ${selectedChat?.id === chat.id ? "bg-yellow-100/80 border border-yellow-300" : "hover:bg-gray-100/80"}`} onClick={() => setSelectedChat(chat)}>
              <span className="flex-1 truncate text-base font-medium text-gray-800">{chat.title}</span>
              <button
                className={`text-xl ${chat.isFavorite ? "text-yellow-500" : "text-gray-400"} hover:scale-125 transition-all`}
                title={chat.isFavorite ? "Favorilerden çıkar" : "Favorile"}
                disabled={favChatLoading === chat.id}
                onClick={e => { e.stopPropagation(); handleToggleFavoriteChat(chat.id, !!chat.isFavorite); }}
              >★</button>
              <button
                className="text-red-400 hover:text-red-600 text-xl hover:scale-125 transition-all"
                title="Sil"
                disabled={delChatLoading === chat.id}
                onClick={e => { e.stopPropagation(); handleDeleteChat(chat.id); }}
              >🗑️</button>
            </div>
          ))}
        </div>
      </div>
      {/* Chat Panel */}
      <div className="flex-1 max-w-2xl w-full bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl p-8 flex flex-col gap-4 z-10 border border-indigo-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2 tracking-tight">
          <span className="text-4xl">🤖</span> AI Asistan
        </h1>
        <div ref={chatRef} className="flex-1 max-h-[50vh] overflow-y-auto flex flex-col gap-3 py-2 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={msg.id || i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}> 
              <div className={`relative flex items-center group`}>
                <div className={`rounded-2xl px-5 py-3 w-fit min-w-[120px] max-w-[80vw] md:max-w-[60%] shadow-xl text-base font-semibold break-words ${msg.role === "user" ? "bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-400 text-white self-end" : "bg-gradient-to-br from-yellow-200 via-yellow-100 to-white text-gray-900 self-start"}`}
                  style={{ wordBreak: 'break-word', textAlign: 'left', boxShadow: '0 4px 24px 0 rgba(80,80,180,0.10)' }}>
                  {msg.role === "assistant" ? cleanMarkdown(msg.content) : msg.content}
                </div>
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className={`text-xl ${msg.isFavorite ? "text-yellow-500" : "text-gray-400"} hover:scale-125 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400`}
                    title={msg.isFavorite ? "Favorilerden çıkar" : "Favorile"}
                    disabled={favMsgLoading === msg.id}
                    onClick={() => handleToggleFavoriteMsg(msg.id!, !!msg.isFavorite)}
                  >★</button>
                  <button
                    className="text-red-400 hover:text-red-600 text-xl hover:scale-125 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                    title="Sil"
                    disabled={delMsgLoading === msg.id}
                    onClick={() => handleDeleteMsg(msg.id!)}
                  >🗑️</button>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-5 py-3 max-w-[80%] bg-yellow-100 text-gray-700 shadow animate-pulse text-base">Yanıt yazılıyor...</div>
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg px-4 py-2 text-base mb-2">
              Hata: {error}
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-2">
          <textarea
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none bg-white/80 shadow text-base"
            rows={2}
            placeholder="Sorunu veya almak istediğin tavsiyeyi yaz..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || !selectedChat}
            maxLength={500}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim() || !selectedChat}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-300 text-white font-bold text-lg shadow hover:from-yellow-500 hover:to-yellow-400 transition-all disabled:opacity-50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
} 