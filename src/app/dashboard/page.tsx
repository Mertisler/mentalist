'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import MoodSelector from '@/components/MoodTracker/MoodSelector';
import MoodSuggestions from '@/components/MoodTracker/MoodSuggestions';

type MoodEntry = {
  id: string;
  mood: string;
  note: string;
  timestamp: any;
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchMoodHistory(user.uid);
      } else {
        router.push('/auth');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchMoodHistory = async (uid: string) => {
    try {
      const q = query(
        collection(db, 'moods'),
        where('userId', '==', uid)
      );
      const querySnapshot = await getDocs(q);
      const moods = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MoodEntry[];
      
      // Verileri JavaScript tarafında sıralayalım
      moods.sort((a, b) => {
        const dateA = a.timestamp?.toDate() || new Date(0);
        const dateB = b.timestamp?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setMoodHistory(moods);
    } catch (error) {
      console.error('Error fetching mood history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // En son mood'u bul
  const lastMood = moodHistory.length > 0 ? moodHistory[0] : null;
  const lastMoodLabel = lastMood?.mood || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Üst Bar */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">🧠</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Mentalist</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              >
                Çıkış Yap
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Ana İçerik */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Öneriler */}
        {lastMoodLabel && <MoodSuggestions moodLabel={lastMoodLabel} />}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Taraf - Duygu Seçici */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Bugün Nasıl Hissediyorsun?</h2>
              <MoodSelector onMoodSaved={() => fetchMoodHistory(user.uid)} />
            </motion.div>
          </div>

          {/* Sağ Taraf - Duygu Geçmişi */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Duygu Geçmişi</h2>
              <div className="space-y-4">
                {moodHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Henüz duygu kaydı bulunmuyor.</p>
                ) : (
                  moodHistory.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{entry.mood}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.timestamp?.toDate()).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="text-gray-600 text-sm break-words">{entry.note}</p>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
} 