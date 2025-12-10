import React, { useState, useEffect, useRef } from 'react';
import Snowfall from './components/Snowfall';
import ScratchCard from './components/ScratchCard';
import { ScratchItemData } from './types';

// Helper to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const App: React.FC = () => {
  const [items, setItems] = useState<ScratchItemData[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [activeCardId, setActiveCardId] = useState<number | null>(null);
  const [lastRevealed, setLastRevealed] = useState<ScratchItemData | null>(null);
  const revealSoundRef = useRef<HTMLAudioElement | null>(null);

  // Preload audio assets (place files in public/sounds/). Use BASE_URL so GH Pages paths work.
  useEffect(() => {
    const revealSrc = `${import.meta.env.BASE_URL}sounds/reveal.mp3`;
    revealSoundRef.current = new Audio(revealSrc);
    if (revealSoundRef.current) {
      revealSoundRef.current.volume = 0.8;
    }
  }, []);

  const playSound = (audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Ignore autoplay errors; user interaction should allow playback
    });
  };

  // Initialize Game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    // Generate numbers 1-17
    const numbers = Array.from({ length: 17 }, (_, i) => i + 1);
    const shuffled = shuffleArray(numbers);
    
    const newItems: ScratchItemData[] = shuffled.map((val, index) => ({
      id: index,
      value: val,
      isRevealed: false
    }));

    setItems(newItems);
    setRevealedCount(0);
    setGameWon(false);
    setActiveCardId(null);
    setLastRevealed(null);
  };

  const handleReveal = (id: number) => {
    setItems(prevItems => {
        const newItems = prevItems.map(item => 
            item.id === id ? { ...item, isRevealed: true } : item
        );
        
        // Check win condition based on new state
        const count = newItems.filter(i => i.isRevealed).length;
        setRevealedCount(count);
        const revealedItem = newItems.find(i => i.id === id) || null;
        setLastRevealed(revealedItem);
        if (count === 17) {
            setGameWon(true);
        }
        return newItems;
    });
    playSound(revealSoundRef);
    setActiveCardId(null);
  };

  const handleStartScratch = (id: number) => {
    // Prevent switching to another card while currently scratching one
    if (activeCardId !== null && activeCardId !== id) return;
    setActiveCardId(id);
    setLastRevealed(null);
  };

  const handleScratchEnd = () => {
    // Keep the active card locked until it is actually revealed.
    // No-op here; unlock happens in handleReveal.
  };

  return (
    <div className="min-h-screen bg-holiday-dark text-holiday-cream relative selection:bg-holiday-red selection:text-white">
      <Snowfall />

      <main className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
        
        {/* Header Section */}
        <header className="text-center mb-8 animate-fade-in-down">
          <h1 className="font-christmas text-5xl md:text-7xl text-holiday-red drop-shadow-[0_2px_2px_rgba(255,255,255,0.5)] mb-2">
            Коледна Томбола
          </h1>
          {/* <p className="text-holiday-gold text-lg md:text-xl font-light tracking-wide mb-6">
            Открий всички 15 скрити числа, за да завършиш колекцията!
          </p> */}
          
          <div className="flex items-center justify-center space-x-4 bg-black/40 p-4 rounded-full backdrop-blur-sm border border-holiday-green">
            <div className="flex flex-col items-center px-4">
                <span className="text-xs text-gray-400 uppercase tracking-wider">Изтрити</span>
                <span className="text-2xl font-bold text-white">{revealedCount} / 17</span>
            </div>
            {gameWon && (
                 <button 
                 onClick={startNewGame}
                 className="bg-holiday-red hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg border-2 border-holiday-gold"
               >
                 Играй отново
               </button>
            )}
          </div>
        </header>

        {/* Game Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8 mb-12">
          {items.map((item) => (
            <ScratchCard 
              key={item.id} 
              item={item} 
              onReveal={handleReveal}
              onStartScratch={handleStartScratch}
              onScratchEnd={handleScratchEnd}
              isLocked={activeCardId !== null && activeCardId !== item.id}
              width={160} // Fixed size for consistency, responsiveness handled by grid scaling if needed
              height={160}
            />
          ))}
        </div>

        {/* Reveal Overlay */}
        {lastRevealed && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                <div className="bg-holiday-cream text-holiday-dark p-8 rounded-2xl max-w-lg w-full text-center border-4 border-holiday-gold shadow-2xl transform scale-100 animate-bounce-in">
                    <div className="mb-4 text-6xl">✨</div>
                    <h2 className="font-christmas text-5xl text-holiday-red mb-2">Печелиш подарък!</h2>
                    <p className="text-4xl font-bold text-holiday-green mb-6">{lastRevealed.value}</p>
                    <button 
                        onClick={() => setLastRevealed(null)}
                        className="w-full bg-holiday-green hover:bg-green-700 text-white text-xl font-bold py-4 px-8 rounded-xl transition-colors shadow-lg"
                    >
                        Продължи
                    </button>
                </div>
            </div>
        )}

        {/* Footer
        <footer className="mt-auto py-6 text-center text-gray-500 text-sm">
           <p>© 2024 Christmas Games Inc. Scratch to win happiness!</p>
        </footer> */}

        {/* Win Overlay Modal */}
        {gameWon && !lastRevealed && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                <div className="bg-holiday-cream text-holiday-dark p-8 rounded-2xl max-w-lg w-full text-center border-4 border-holiday-gold shadow-2xl transform scale-100 animate-bounce-in">
                    <div className="mb-4 text-6xl">🎅</div>
                    <h2 className="font-christmas text-5xl text-holiday-red mb-4">Честита Коледа!</h2>
                    <p className="text-xl mb-8">Ти откри всички подаръци!</p>
                    <button 
                        onClick={startNewGame}
                        className="w-full bg-holiday-green hover:bg-green-700 text-white text-xl font-bold py-4 px-8 rounded-xl transition-colors shadow-lg"
                    >
                        Започни нова игра
                    </button>
                </div>
            </div>
        )}

      </main>
      
      {/* Tailwind Custom Animations styles injected here since we can't use external CSS */}
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes bounceIn {
            0% { transform: scale(0.8); opacity: 0; }
            70% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); }
        }
        .animate-bounce-in {
            animation: bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes pulseSlow {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0px rgba(248, 178, 41, 0); }
            50% { transform: scale(1.02); box-shadow: 0 0 20px rgba(248, 178, 41, 0.3); }
        }
        .animate-pulse-slow {
            animation: pulseSlow 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
