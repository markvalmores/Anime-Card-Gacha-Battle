import React, { useState, useRef, useEffect } from 'react';
import { AppScreen, CardData, PlayerState, Rarity, ElementType } from '../types';
import { TopBar } from '../components/ui/TopBar';
import { Card } from '../components/Card';
import { Button } from '../components/ui/Button';
import { RARITY_STATS, RARITY_SELL_VALUES } from '../constants';
import { fetchAnimeWallpaper } from '../utils/animeImageApi';
import { generateProceduralSkills, generateCardProfiles, generateProceduralDescription } from '../services/geminiService';

interface DeckScreenProps {
  playerState: PlayerState;
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>;
  changeScreen: (screen: AppScreen) => void;
}

export const DeckScreen: React.FC<DeckScreenProps> = ({ playerState, setPlayerState, changeScreen }) => {
  const [filter, setFilter] = useState<Rarity | 'ALL'>('ALL');
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [cardToSell, setCardToSell] = useState<CardData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bgUrl, setBgUrl] = useState('');

  useEffect(() => {
    fetchAnimeWallpaper().then(setBgUrl);
  }, []);

  const getImportRarity = (): Rarity => {
    const rand = Math.random();
    const importRates: [Rarity, number][] = [
      [Rarity.UR, 0.20],
      [Rarity.SSR, 0.30],
      [Rarity.SR, 0.30],
      [Rarity.R, 0.15],
      [Rarity.N, 0.05]
    ];
    
    let cumulative = 0;
    for (const [r, rate] of importRates) {
      cumulative += rate;
      if (rand <= cumulative) return r;
    }
    return Rarity.SR;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      
      const elements = Object.values(ElementType);
      const element = elements[Math.floor(Math.random() * elements.length)];
      
      const rolledRarity = getImportRarity();
      const stats = RARITY_STATS[rolledRarity];
      const variance = () => (0.9 + Math.random() * 0.2);

      // Instant fetch via background object pool
      const profiles = await generateCardProfiles(1, [element]);
      const profile = profiles[0];
      const fallbackName = `Custom ${file.name.split('.')[0].substring(0, 10)}`;

      const newCard: CardData = {
        id: `custom_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: profile?.name || fallbackName,
        rarity: rolledRarity,
        element: element,
        imageUrl: result,
        hp: Math.floor(stats.hp * variance()),
        maxHp: Math.floor(stats.hp * variance()),
        attack: Math.floor(stats.atk * variance()),
        defense: Math.floor(stats.def * variance()),
        description: profile?.description || generateProceduralDescription(element, profile?.name || fallbackName),
        isCustom: true,
        skills: profile?.skills || generateProceduralSkills(element, profile?.name || fallbackName)
      };

      setPlayerState(prev => ({
        ...prev,
        inventory: [newCard, ...prev.inventory]
      }));

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSellClick = () => {
    if (!selectedCard) return;
    
    if (selectedCard.rarity === Rarity.UR || selectedCard.rarity === Rarity.SSR) {
       // Open custom confirmation modal instead of blocking thread with window.confirm
       setCardToSell(selectedCard);
    } else {
       executeSell(selectedCard);
    }
  };

  const executeSell = (card: CardData) => {
    const sellValue = RARITY_SELL_VALUES[card.rarity] || 10;
    
    setPlayerState(prev => ({
      ...prev,
      credits: prev.credits + sellValue,
      inventory: prev.inventory.filter(c => c.id !== card.id)
    }));
    
    setCardToSell(null);
    setSelectedCard(null);
  };

  const filteredInventory = playerState.inventory.filter(c => filter === 'ALL' || c.rarity === filter);

  const rarityValues = { [Rarity.UR]: 5, [Rarity.SSR]: 4, [Rarity.SR]: 3, [Rarity.R]: 2, [Rarity.N]: 1 };
  filteredInventory.sort((a, b) => {
    if (rarityValues[b.rarity] !== rarityValues[a.rarity]) {
      return rarityValues[b.rarity] - rarityValues[a.rarity];
    }
    // Safe ID sorting to prevent localeCompare errors on undefined IDs
    return (b.id || '').localeCompare(a.id || '');
  });

  return (
    <div className="relative w-full h-full bg-slate-900 flex flex-col transform-gpu">
      {bgUrl && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-20 mix-blend-overlay transition-all duration-1000 transform-gpu" 
          style={{ backgroundImage: `url(${bgUrl})` }}
        ></div>
      )}

      <TopBar playerState={playerState} onBack={() => changeScreen(AppScreen.HOME)} title="MY DECK" />

      <div className="relative z-10 flex-1 flex flex-col pt-24 px-8 pb-8 overflow-hidden transform-gpu will-change-transform">
        
        <div className="flex justify-between items-center mb-6 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl transform-gpu">
          <div className="flex gap-2">
            {['ALL', Rarity.UR, Rarity.SSR, Rarity.SR, Rarity.R, Rarity.N].map(r => (
              <button 
                key={r}
                onClick={() => setFilter(r as any)}
                className={`px-4 py-1 rounded font-bold text-sm transform-gpu ${filter === r ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-400 hover:bg-slate-600'}`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/gif" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
               IMPORT .GIF / .PNG
            </Button>
            <div className="text-gray-400 text-sm bg-black/50 px-3 py-1 rounded border border-white/10">
              Total Cards: <span className="text-white font-bold">{playerState.inventory.length}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 pb-12 transform-gpu will-change-transform">
          {filteredInventory.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-xl font-bold">
              NO CARDS FOUND
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 transform-gpu">
              {filteredInventory.map(card => (
                <Card 
                  key={card.id} 
                  card={card} 
                  size="sm" 
                  onClick={() => setSelectedCard(card)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-[fadeIn_0.1s_ease-out] transform-gpu">
           <div className="relative bg-slate-800 border-2 border-slate-600 rounded-3xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] transform-gpu">
             
             <div className="md:w-1/2 bg-black flex items-center justify-center p-8 relative transform-gpu">
               <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-transparent to-slate-800 opacity-50 transform-gpu"></div>
               <Card card={selectedCard} size="lg" className="z-10 shadow-2xl" is3D={true} />
             </div>

             <div className="md:w-1/2 p-8 flex flex-col max-h-[90vh] overflow-y-auto transform-gpu will-change-transform">
                <button 
                  onClick={() => setSelectedCard(null)}
                  className="absolute top-4 right-4 bg-slate-700 hover:bg-slate-500 text-white w-10 h-10 rounded-full font-bold flex items-center justify-center transition-colors z-20 shadow-lg"
                >
                  ✕
                </button>

                <div className="flex items-center justify-between mb-2 mt-4 md:mt-0">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded font-black text-sm ${selectedCard.rarity === Rarity.UR ? 'bg-red-500 text-white' : selectedCard.rarity === Rarity.SSR ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'}`}>
                      {selectedCard.rarity}
                    </span>
                    <span className="bg-slate-700 px-3 py-1 rounded font-bold text-sm text-white">
                      {selectedCard.element}
                    </span>
                  </div>
                  
                  <Button variant="danger" size="sm" onClick={handleSellClick} className="flex items-center gap-2">
                    SELL FOR <span className="text-yellow-300 font-black">{RARITY_SELL_VALUES[selectedCard.rarity]} C</span>
                  </Button>
                </div>

                <h2 className={`text-4xl font-black mb-4 uppercase tracking-wider ${selectedCard.rarity === Rarity.UR ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400' : 'text-white'}`}>
                  {selectedCard.name}
                </h2>

                <div className="bg-black/40 p-4 rounded-xl border border-white/10 mb-6 text-gray-300 italic">
                  "{selectedCard.description}"
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-900/40 border border-green-500/30 p-3 rounded-xl text-center">
                    <div className="text-gray-400 text-xs uppercase font-bold mb-1">Health</div>
                    <div className="text-green-400 font-black text-xl">{selectedCard.hp}</div>
                  </div>
                  <div className="bg-orange-900/40 border border-orange-500/30 p-3 rounded-xl text-center">
                    <div className="text-gray-400 text-xs uppercase font-bold mb-1">Attack</div>
                    <div className="text-orange-400 font-black text-xl">{selectedCard.attack}</div>
                  </div>
                  <div className="bg-blue-900/40 border border-blue-500/30 p-3 rounded-xl text-center">
                    <div className="text-gray-400 text-xs uppercase font-bold mb-1">Defense</div>
                    <div className="text-blue-400 font-black text-xl">{selectedCard.defense}</div>
                  </div>
                </div>

                <h3 className="text-xl font-black text-white mb-3 uppercase border-b border-gray-600 pb-2">Combat Skills</h3>
                <div className="space-y-3">
                  {(selectedCard.skills || generateProceduralSkills(selectedCard.element, selectedCard.name)).map(skill => (
                    <div key={skill.type} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-lg text-white">{skill.name}</span>
                        <span className="text-xs font-black uppercase tracking-wider text-gray-400 bg-black/50 px-2 py-1 rounded">{skill.type}</span>
                      </div>
                      <p className="text-sm text-gray-300">{skill.description}</p>
                    </div>
                  ))}
                </div>
             </div>
           </div>
        </div>
      )}

      {/* Proper UI Sell Confirmation Modal */}
      {cardToSell && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[fadeIn_0.1s_ease-out] transform-gpu">
          <div className="bg-slate-800 border-2 border-red-500 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_30px_rgba(239,68,68,0.5)] transform-gpu">
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">Confirm Sell</h3>
            <p className="text-gray-300 mb-6">
              Are you absolutely sure you want to sell <span className={`${cardToSell.rarity === Rarity.UR ? 'text-red-400' : 'text-yellow-400'} font-bold`}>{cardToSell.name}</span> for <span className="text-yellow-400 font-bold">{RARITY_SELL_VALUES[cardToSell.rarity]} C</span>? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <Button variant="danger" className="flex-1" onClick={() => executeSell(cardToSell)}>SELL</Button>
              <Button variant="secondary" className="flex-1" onClick={() => setCardToSell(null)}>CANCEL</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
