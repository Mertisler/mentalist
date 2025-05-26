'use client';

import { useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';

type Mood = {
  emoji: string;
  label: string;
  color: string;
};

const moods: Mood[] = [
  { emoji: '😊', label: 'Mutlu', color: 'bg-yellow-100 hover:bg-yellow-200' },
  { emoji: '😌', label: 'Huzurlu', color: 'bg-green-100 hover:bg-green-200' },
  { emoji: '😐', label: 'Normal', color: 'bg-blue-100 hover:bg-blue-200' },
  { emoji: '😔', label: 'Üzgün', color: 'bg-purple-100 hover:bg-purple-200' },
  { emoji: '😰', label: 'Endişeli', color: 'bg-red-100 hover:bg-red-200' },
];

interface MoodSelectorProps {
  onMoodSaved?: () => void;
}

export default function MoodSelector({ onMoodSaved }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) {
      setError('Lütfen bir duygu seçin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Kullanıcı bulunamadı');

      await addDoc(collection(db, 'moods'), {
        userId: user.uid,
        mood: selectedMood.emoji,
        label: selectedMood.label,
        note,
        timestamp: serverTimestamp(),
      });

      setSelectedMood(null);
      setNote('');
      if (onMoodSaved) onMoodSaved();
    } catch (err) {
      setError('Duygu kaydedilirken bir hata oluştu');
      console.error('Error saving mood:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {moods.map((mood) => (
          <motion.button
            key={mood.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setSelectedMood(mood)}
            className={`p-4 rounded-xl flex flex-col items-center justify-center space-y-2 transition-all ${
              selectedMood?.label === mood.label
                ? `${mood.color} ring-2 ring-offset-2 ring-indigo-500`
                : `${mood.color}`
            }`}
          >
            <span className="text-3xl">{mood.emoji}</span>
            <span className="text-sm font-medium text-gray-700">{mood.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="space-y-2">
        <label htmlFor="note" className="text-sm font-medium text-gray-700">
          Not (İsteğe bağlı)
        </label>
        <textarea
          id="note"
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          placeholder="Bugün neler hissettiniz?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading || !selectedMood}
        className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all ${
          selectedMood
            ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Kaydediliyor...
          </div>
        ) : (
          'Kaydet'
        )}
      </motion.button>
    </form>
  );
} 