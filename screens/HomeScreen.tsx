import React, { useState, useEffect } from 'react';
import { AppScreen, PlayerState } from '../types';
import { Button } from '../components/ui/Button';
import { TopBar } from '../components/ui/TopBar';
import { fetchAnimeWallpaper, fetchAnimeThumbnail } from '../utils/animeImageApi';

interface HomeScreenProps {
  playerState: PlayerState;
  changeScreen: (screen: AppScreen) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ playerState, changeScreen }) => {
  const [images, setImages] = useState({ bg: '', battle: '', gacha: '', deck: '' });
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchAnimeWallpaper(),
      fetchAnimeThumbnail(),
      fetchAnimeThumbnail(),
      fetchAnimeThumbnail()
    ]).then(([bg, battle, gacha, deck]) => {
      setImages({ bg, battle, gacha, deck });
    });
  }, []);

  return (
    <div 
      className="relative w-full h-full bg-slate-900 bg-cover bg-center transition-all duration-1000"
      style={{ backgroundImage: images.bg ? `url(${images.bg})` : undefined }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      <TopBar playerState={playerState} title="HOME HUB" />

      {/* Info Button */}
      <button 
        onClick={() => setShowHelp(true)}
        className="absolute top-24 right-8 z-20 bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 rounded-full font-black text-2xl shadow-[0_0_15px_rgba(37,99,235,0.8)] border-2 border-blue-300 flex items-center justify-center transition-transform hover:scale-110"
      >
        ?
      </button>

      <div className="relative z-10 h-full flex flex-col items-center justify-center pt-20">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl px-8">
          
          {/* Battle Portal */}
          <div className="group relative rounded-2xl overflow-hidden border border-red-500/30 hover:border-red-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] cursor-pointer bg-slate-800" onClick={() => changeScreen(AppScreen.BATTLE)}>
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"
              style={{ backgroundImage: images.battle ? `url(${images.battle})` : undefined }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 via-red-900/40 to-transparent"></div>
            <div className="relative p-8 h-96 flex flex-col justify-end">
              <h2 className="text-4xl font-black text-white mb-2 drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">STAGE BATTLE</h2>
              <p className="text-red-200">Enter the 2.5D Arena and fight random enemies to earn exp and credits.</p>
            </div>
          </div>

          {/* Gacha Portal */}
          <div className="group relative rounded-2xl overflow-hidden border border-yellow-500/30 hover:border-yellow-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(234,179,8,0.4)] cursor-pointer bg-slate-800" onClick={() => changeScreen(AppScreen.GACHA)}>
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"
              style={{ backgroundImage: images.gacha ? `url(${images.gacha})` : undefined }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/90 via-yellow-900/40 to-transparent"></div>
            <div className="relative p-8 h-96 flex flex-col justify-end">
              <h2 className="text-4xl font-black text-white mb-2 drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">SUMMON</h2>
              <p className="text-yellow-200">Spend credits on the Daily AI Banner. Guaranteed UR at 100 pity!</p>
              <div className="mt-4 flex gap-2 items-center text-sm font-bold bg-black/50 w-fit px-3 py-1 rounded text-yellow-400">
                Pity: {playerState.pityCount}/100
              </div>
            </div>
          </div>

          {/* Deck Portal */}
          <div className="group relative rounded-2xl overflow-hidden border border-blue-500/30 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] cursor-pointer bg-slate-800" onClick={() => changeScreen(AppScreen.DECK)}>
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"
              style={{ backgroundImage: images.deck ? `url(${images.deck})` : undefined }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent"></div>
            <div className="relative p-8 h-96 flex flex-col justify-end">
              <h2 className="text-4xl font-black text-white mb-2 drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">MY DECK</h2>
              <p className="text-blue-200">View your characters, import custom cards, and view stats.</p>
              <div className="mt-4 flex gap-2 items-center text-sm font-bold bg-black/50 w-fit px-3 py-1 rounded text-blue-400">
                Cards: {playerState.inventory.length}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-slate-800 border-2 border-blue-500 rounded-2xl max-w-2xl w-full p-8 shadow-[0_0_50px_rgba(37,99,235,0.4)] max-h-[90vh] overflow-y-auto">
            <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-widest border-b border-gray-600 pb-4">How to Play</h2>
            
            <div className="space-y-6 text-gray-300">
              <section>
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">1. Gacha Summoning</h3>
                <p>Use credits earned from battles to summon new unique cards. Banners are AI-generated daily, featuring ultra-rare, uniquely named characters. 10x Pull guarantees an SR. Pity system guarantees a UR at 100 pulls!</p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-red-400 mb-2">2. Combat System</h3>
                <p>Engage in 2.5D battles against AI-generated bosses. Damage is calculated using RPG scaling formulas. You have 4 unique skills:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><span className="font-bold text-blue-400">BASIC (0 CD):</span> 1.0x Damage. Your reliable auto-attack.</li>
                  <li><span className="font-bold text-orange-400">HEAVY (2 CD):</span> 1.8x Damage. Breaks through shields effectively.</li>
                  <li><span className="font-bold text-green-400">DEFEND (2 CD):</span> Gains a massive shield to absorb incoming attacks.</li>
                  <li><span className="font-bold text-purple-400">ULTIMATE (4 CD):</span> 2.5x Damage + moderate shield. The tide-turner.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-blue-400 mb-2">3. Deck & Imports</h3>
                <p>View your collected warriors in the Deck menu. Click on a card to see its full AI-generated lore, stats, and skill descriptions. You can also import custom .gif or .jpg images to create your own UR cards!</p>
              </section>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={() => setShowHelp(false)} className="px-8 py-3 text-lg">GOT IT</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
