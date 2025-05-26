"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { User } from "firebase/auth";

const DEFAULT_AFFIRMATIONS = [
  "Bugün kendime değer vereceğim.",
  "Her yeni gün yeni bir başlangıçtır.",
  "Kendime nazik olmayı seçiyorum.",
  "Zorluklar beni güçlendirir.",
  "Küçük adımlar büyük değişimler yaratır.",
  "Bugün güzel şeyler olacak."
];

export default function AffirmationsPage() {
  const [user, setUser] = useState<User | null>(null);
  type Affirmation = { id: string; text: string; createdAt: string; favorite: boolean };
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [newAffirmation, setNewAffirmation] = useState("");
  const [loading, setLoading] = useState(true);
  const [favLoading, setFavLoading] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Günün telkini için rastgele veya sırayla seç
  const todaysAffirmation = affirmations.length > 0
    ? affirmations[Math.floor((new Date().getDate() + new Date().getMonth()) % affirmations.length)]
    : DEFAULT_AFFIRMATIONS[Math.floor(Math.random() * DEFAULT_AFFIRMATIONS.length)];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        await fetchAffirmations(u.uid);
      } else {
        router.push("/auth");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchAffirmations = async (uid: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, "affirmations"), where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text || "",
        createdAt: doc.data().createdAt || "",
        favorite: doc.data().favorite || false
      }));
      setAffirmations(data);
    } catch (e) {
      setAffirmations([] as Affirmation[]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAffirmation = async () => {
    setError("");
    const text = newAffirmation.trim();
    if (!text) {
      setError("Telkin boş olamaz.");
      return;
    }
    if (!user) return;
    await addDoc(collection(db, "affirmations"), {
      userId: user.uid,
      text,
      createdAt: new Date().toISOString(),
      favorite: false,
    });
    setNewAffirmation("");
    await fetchAffirmations(user.uid);
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    setFavLoading(id);
    if (!user) return;
    await updateDoc(doc(db, "affirmations", id), { favorite: !current });
    await fetchAffirmations(user.uid);
    setFavLoading("");
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "affirmations", id));
    await fetchAffirmations(user.uid);
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-10 px-2 flex flex-col items-center">
      <div className="max-w-xl w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 flex flex-col gap-8">
        {/* Günün Telkini */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl">🗓️</div>
          <div className="text-lg font-semibold text-indigo-700 text-center">Günün Telkini</div>
          <div className="text-center text-gray-800 text-xl font-bold bg-indigo-50 rounded-lg px-4 py-3 mt-2 shadow">
            {typeof todaysAffirmation === "string" ? todaysAffirmation : todaysAffirmation.text}
          </div>
        </div>
        {/* Telkin Ekle */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">Telkin Ekle</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Bugün kendime..."
              value={newAffirmation}
              onChange={e => setNewAffirmation(e.target.value)}
              maxLength={120}
            />
            <button
              onClick={handleAddAffirmation}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all"
            >
              ➕
            </button>
          </div>
          {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
        </div>
        {/* Telkin Defterim */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-2xl">📘</div>
            <div className="font-semibold text-gray-800">Telkin Defterim</div>
          </div>
          {affirmations.length === 0 ? (
            <div className="text-gray-500 text-center py-4">Henüz telkin eklemediniz.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {affirmations.map((a) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-white rounded-lg shadow border border-gray-100 px-4 py-2"
                >
                  <button
                    onClick={() => handleToggleFavorite(a.id, a.favorite)}
                    className={`text-xl ${a.favorite ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"} transition-all`}
                    title={a.favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
                    disabled={favLoading === a.id}
                  >
                    ★
                  </button>
                  <div className="flex-1 text-gray-800 text-sm">
                    {a.text}
                    <span className="block text-xs text-gray-400 mt-1">
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-red-400 hover:text-red-600 text-lg px-2 py-1 rounded transition-all"
                    title="Sil"
                  >
                    🗑️
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 