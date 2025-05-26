import React from 'react';
import { motion } from 'framer-motion';

const suggestionsData: Record<string, { title: string; description: string; link?: string; video?: string }[]> = {
  'Üzgün': [
    {
      title: 'Meditasyon',
      description: 'Zihnini sakinleştirmek için kısa bir meditasyon yapabilirsin.',
      link: 'https://www.youtube.com/watch?v=inpok4MKVLM',
    },
    {
      title: 'Nefes Egzersizi',
      description: 'Derin nefes alıp vererek rahatlamayı dene.',
      video: 'https://www.youtube.com/embed/SEfs5TJZ6Nk',
    },
    {
      title: 'Kendini Suçlama',
      description: 'Herkes zaman zaman kendini kötü hissedebilir. Kendine nazik ol.',
    },
  ],
  'Endişeli': [
    {
      title: 'Nefes Sayacı',
      description: 'Nefesini sayarak kaygını azaltabilirsin.',
      link: 'https://nefesegzersizi.com/',
    },
    {
      title: 'Rehberli Meditasyon',
      description: 'Sesli meditasyon ile rahatla.',
      link: 'https://www.youtube.com/watch?v=MIr3RsUWrdo',
    },
  ],
  'Mutlu': [
    {
      title: 'Gelişim Önerisi',
      description: 'Bugün yeni bir şey öğrenmeye ne dersin?',
      link: 'https://www.ted.com/talks',
    },
    {
      title: 'Motive Edici Yazı',
      description: 'Küçük adımlar büyük değişimler yaratır. Harika gidiyorsun!',
    },
  ],
  'Huzurlu': [
    {
      title: 'Şükran Listesi',
      description: 'Bugün minnettar olduğun 3 şeyi yaz.',
    },
    {
      title: 'Doğa Yürüyüşü',
      description: 'Kısa bir yürüyüş ile huzurunu pekiştir.',
    },
  ],
  'Normal': [
    {
      title: 'Küçük Bir Mola',
      description: 'Kendine kısa bir mola ver, bir kahve iç.',
    },
    {
      title: 'Günlük Planı',
      description: 'Bugünün planını gözden geçir.',
    },
  ],
};

interface MoodSuggestionsProps {
  moodLabel: string;
}

const MoodSuggestions: React.FC<MoodSuggestionsProps> = ({ moodLabel }) => {
  const suggestions = suggestionsData[moodLabel] || [];

  if (suggestions.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Senin İçin Öneriler</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl shadow p-5 border border-gray-100 flex flex-col gap-2"
          >
            <div className="font-semibold text-indigo-700 text-lg">{item.title}</div>
            <div className="text-gray-700 text-sm">{item.description}</div>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 underline text-sm mt-1"
              >
                Kaynağa Git
              </a>
            )}
            {item.video && (
              <div className="mt-2">
                <iframe
                  width="100%"
                  height="180"
                  src={item.video}
                  title={item.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg border"
                ></iframe>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MoodSuggestions; 