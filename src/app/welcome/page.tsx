"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";

const MESSAGES = [
  "Bugün harika bir gün olacak!",
  "Küçük adımlar büyük değişimler yaratır.",
  "Kendine nazik olmayı unutma.",
  "Her yeni gün yeni bir başlangıçtır.",
  "Sen çok güçlüsün!",
  "Hayat, denemeye devam edenlerindir.",
  "Gülümsemek sana çok yakışıyor!",
  "Bugün kendin için güzel bir şey yap!"
];

const getDisplayName = (user: any) => {
  if (user?.displayName) return user.displayName.split(" ")[0];
  if (user?.email) return user.email.split("@")[0];
  return "!";
};

export default function WelcomePage() {
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
        setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
      } else {
        router.push("/auth");
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-10 max-w-4xl w-full flex flex-col items-center"
      >
        <div className="text-4xl mb-4">👋</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Hoş geldin, {getDisplayName(user)}!
        </h1>
        <div className="text-md text-gray-600 mb-4">{user.email}</div>
        <div className="text-lg text-indigo-700 font-semibold mb-8 text-center">{message}</div>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-center">
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="w-64 h-64 bg-indigo-600 text-white rounded-xl shadow-lg flex flex-col items-center justify-center p-8 cursor-pointer transition-all hover:bg-indigo-700 break-words"
              onClick={() => router.push("/dashboard")}
              style={{wordBreak: 'break-word'}}
            >
              <div className="flex flex-col items-center mb-3">
                <span className="text-4xl mb-2">📈</span>
                <span className="font-bold text-xl text-center">Duygu Takibi</span>
              </div>
              <div className="text-base opacity-80 text-center break-words">Ruh halini ve notlarını kaydet</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="w-64 h-64 bg-pink-500 text-white rounded-xl shadow-lg flex flex-col items-center justify-center p-8 cursor-pointer transition-all hover:bg-pink-600 break-words"
              onClick={() => router.push("/habits")}
              style={{wordBreak: 'break-word'}}
            >
              <div className="flex flex-col items-center mb-3">
                <span className="text-4xl mb-2">✅</span>
                <span className="font-bold text-xl text-center">Alışkanlık Takibi</span>
              </div>
              <div className="text-base opacity-80 text-center break-words">Haftalık alışkanlıklarını takip et</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="w-64 h-64 bg-green-500 text-white rounded-xl shadow-lg flex flex-col items-center justify-center p-8 cursor-pointer transition-all hover:bg-green-600 break-words"
              onClick={() => router.push("/affirmations")}
              style={{wordBreak: 'break-word'}}
            >
              <div className="flex flex-col items-center mb-3">
                <span className="text-4xl mb-2">💬</span>
                <span className="font-bold text-xl text-center">Telkin</span>
              </div>
              <div className="text-base opacity-80 text-center break-words">Motive edici telkinler ve favoriler</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="w-64 h-64 bg-yellow-400 text-white rounded-xl shadow-lg flex flex-col items-center justify-center p-8 cursor-pointer transition-all hover:bg-yellow-500 break-words"
              onClick={() => router.push("/ai-assistant")}
              style={{wordBreak: 'break-word'}}
            >
              <div className="flex flex-col items-center mb-3">
                <span className="text-4xl mb-2">🤖</span>
                <span className="font-bold text-xl text-center">AI Asistan</span>
              </div>
              <div className="text-base opacity-80 text-center break-words">Yapay zeka ile sohbet et, tavsiye al</div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 