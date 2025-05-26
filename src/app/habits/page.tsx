"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_HABITS = [
  { key: "meditasyon", label: "Meditasyon", icon: "🧘", color: "bg-indigo-100", startDate: null, endDate: null },
  { key: "egzersiz", label: "Egzersiz", icon: "🏃", color: "bg-green-100", startDate: null, endDate: null },
  { key: "su", label: "Su İçme", icon: "💧", color: "bg-blue-100", startDate: null, endDate: null },
];

const ICONS = ["🧘", "🏃", "💧", "📚", "🛏️", "🍎", "🧹", "📝", "🧑‍💻", "🧺", "🧴", "🦷", "🧊", "🧃", "🧦", "🧢", "🧤", "🧲", "🧪", "🧯", "🧸"];

const getWeekDays = () => {
  const days = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay()); // Pazardan başlat
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      date: d,
      label: d.toLocaleDateString("tr-TR", { weekday: "short", day: "2-digit", month: "2-digit" }),
      key: d.toISOString().split("T")[0],
    });
  }
  return days;
};

function getMotivationMessage(percent: number) {
  if (percent === 100) return "Mükemmel! Tüm hafta tamamlandı!";
  if (percent >= 70) return "Harika gidiyorsun!";
  if (percent >= 40) return "İyi başladın, devam et!";
  if (percent > 0) return "Her gün bir adım!";
  return "Hadi bu hafta bir alışkanlık başlat!";
}

export default function HabitsPage() {
  const [user, setUser] = useState<any>(null);
  const [habitData, setHabitData] = useState<any>({});
  const [userHabits, setUserHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newHabitLabel, setNewHabitLabel] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState(ICONS[0]);
  const [newHabitStartDate, setNewHabitStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newHabitEndDate, setNewHabitEndDate] = useState("");
  const [modalError, setModalError] = useState("");
  const weekDays = getWeekDays();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        await fetchHabits(u.uid);
        await fetchUserHabits(u.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchHabits = async (uid: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, "habits", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setHabitData(docSnap.data());
      } else {
        setHabitData({});
      }
    } catch (e) {
      setHabitData({});
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHabits = async (uid: string) => {
    try {
      const docRef = doc(db, "habitList", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserHabits(docSnap.data().habits || []);
      } else {
        setUserHabits(DEFAULT_HABITS);
        await saveUserHabits(uid, DEFAULT_HABITS);
      }
    } catch (e) {
      setUserHabits(DEFAULT_HABITS);
      await saveUserHabits(uid, DEFAULT_HABITS);
    }
  };

  const saveUserHabits = async (uid: string, habits: any[]) => {
    await setDoc(doc(db, "habitList", uid), { habits });
  };

  const handleCheck = async (habitKey: string, dayKey: string, checked: boolean) => {
    if (!user) return;
    const newData = {
      ...habitData,
      [habitKey]: {
        ...(habitData[habitKey] || {}),
        [dayKey]: checked,
      },
    };
    setHabitData(newData);
    await setDoc(doc(db, "habits", user.uid), newData, { merge: true });
  };

  const handleStartDateChange = (val: string) => {
    setNewHabitStartDate(val);
    if (newHabitEndDate && newHabitEndDate < val) {
      setNewHabitEndDate(val);
    }
  };

  const handleAddHabit = async () => {
    setModalError("");
    const label = newHabitLabel.trim();
    if (!label) {
      setModalError("Alışkanlık adı boş olamaz.");
      return;
    }
    if (userHabits.some((h) => h.label.toLowerCase() === label.toLowerCase())) {
      setModalError("Bu isimde bir alışkanlık zaten var.");
      return;
    }
    if (!newHabitStartDate) {
      setModalError("Başlangıç tarihi seçmelisiniz.");
      return;
    }
    if (newHabitEndDate && newHabitEndDate < newHabitStartDate) {
      setModalError("Bitiş tarihi, başlangıç tarihinden önce olamaz.");
      return;
    }
    const newKey = label.toLowerCase().replace(/[^a-z0-9]/gi, "_") + "_" + Math.floor(Math.random() * 10000);
    const newHabit = { key: newKey, label, icon: newHabitIcon, color: "bg-pink-100", startDate: newHabitStartDate, endDate: newHabitEndDate || null };
    const updatedHabits = [...userHabits, newHabit];
    await saveUserHabits(user.uid, updatedHabits);
    setUserHabits(updatedHabits);
    setShowModal(false);
    setNewHabitLabel("");
    setNewHabitIcon(ICONS[0]);
    setNewHabitStartDate(new Date().toISOString().split("T")[0]);
    setNewHabitEndDate("");
  };

  const handleDeleteHabit = async (habitKey: string) => {
    if (!user) return;
    const updatedHabits = userHabits.filter((h) => h.key !== habitKey);
    await saveUserHabits(user.uid, updatedHabits);
    setUserHabits(updatedHabits);
    // O alışkanlığa ait işaretlemeleri de kaldır
    const newData = { ...habitData };
    delete newData[habitKey];
    setHabitData(newData);
    await setDoc(doc(db, "habits", user.uid), newData, { merge: true });
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const getHabitDays = (habit: any) => {
    const days: { date: Date; label: string; key: string }[] = [];
    if (!habit.startDate) return days;
    const start = new Date(habit.startDate);
    const end = habit.endDate ? new Date(habit.endDate) : new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return days;
    let d = new Date(start);
    while (d <= end) {
      const key = d.toISOString().split("T")[0];
      if (!days.some(day => day.key === key)) {
        days.push({
          date: new Date(d),
          label: d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }) + "\n" + d.toLocaleDateString("tr-TR", { weekday: "short" }),
          key,
        });
      }
      d.setDate(d.getDate() + 1);
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-10">
      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alışkanlık Takibi</h1>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="text-left p-2">Alışkanlık</th>
                <th className="text-center p-2 text-xs text-gray-500">Tarihler</th>
                <th className="text-center p-2 text-xs text-gray-500">Haftalık %</th>
              </tr>
            </thead>
            <tbody>
              {userHabits.map((habit) => {
                const habitDays = getHabitDays(habit);
                const doneCount = habitDays.filter((d) => habitData[habit.key]?.[d.key]).length;
                const percent = habitDays.length === 0 ? 0 : Math.round((doneCount / habitDays.length) * 100);
                return (
                  <tr key={habit.key} className="bg-white rounded-lg shadow border border-gray-100 hover:shadow-lg transition-shadow align-top">
                    <td className="font-medium text-gray-700 p-2 flex items-center gap-2">
                      <span className={`text-xl ${habit.color} rounded-lg px-2 py-1`}>{habit.icon}</span>
                      {habit.label}
                      {habit.startDate && (
                        <span className="ml-2 text-xs text-gray-400">({habit.startDate}{habit.endDate ? ` - ${habit.endDate}` : ""})</span>
                      )}
                      <button
                        className="ml-2 text-red-500 hover:text-red-700 text-lg px-2 py-1 rounded transition-all"
                        title="Alışkanlığı Sil"
                        onClick={() => handleDeleteHabit(habit.key)}
                      >
                        🗑️
                      </button>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        {habitDays.map((day) => (
                          <div key={day.key} className="flex flex-col items-center">
                            <span className="text-xs text-gray-500 whitespace-pre-line mb-1">{day.label}</span>
                            <motion.input
                              type="checkbox"
                              checked={!!habitData[habit.key]?.[day.key]}
                              onChange={(e) => handleCheck(habit.key, day.key, e.target.checked)}
                              whileTap={{ scale: 0.9 }}
                              className={`w-5 h-5 accent-indigo-600 rounded focus:ring-2 focus:ring-indigo-400 bg-gray-100 hover:bg-indigo-200 transition-all`}
                            />
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="text-center p-2 align-top">
                      <div className="w-16 mx-auto">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.7 }}
                            className="h-2 bg-green-400 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-600 mt-1">%{percent}</div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all text-sm font-medium"
            onClick={() => setShowModal(true)}
          >
            + Alışkanlık Ekle
          </button>
        </div>
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
              >
                <h2 className="text-xl font-bold mb-4 text-gray-900">Yeni Alışkanlık Ekle</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alışkanlık Adı</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newHabitLabel}
                    onChange={e => setNewHabitLabel(e.target.value)}
                    placeholder="Örn: Kitap Okuma"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">İkon Seç</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map(icon => (
                      <button
                        type="button"
                        key={icon}
                        className={`text-2xl px-2 py-1 rounded-lg border ${newHabitIcon === icon ? "border-indigo-500 bg-indigo-100" : "border-gray-200 bg-gray-50"}`}
                        onClick={() => setNewHabitIcon(icon)}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newHabitStartDate}
                    onChange={e => handleStartDateChange(e.target.value)}
                    max={newHabitEndDate || "2099-12-31"}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi (İsteğe Bağlı)</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newHabitEndDate}
                    onChange={e => setNewHabitEndDate(e.target.value)}
                    min={newHabitStartDate}
                    max="2099-12-31"
                    placeholder="İsteğe bağlı"
                  />
                </div>
                {modalError && <div className="text-red-500 text-sm mb-2">{modalError}</div>}
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                    onClick={() => { setShowModal(false); setModalError(""); }}
                    type="button"
                  >
                    İptal
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-medium"
                    onClick={handleAddHabit}
                    type="button"
                  >
                    Ekle
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 