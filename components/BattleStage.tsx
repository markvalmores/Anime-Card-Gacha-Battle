import React, { useState, useEffect } from 'react';
import { fetchAnimeWallpaper } from '../utils/animeImageApi';

interface BattleStageProps {
  children: React.ReactNode;
  theme: 'forest' | 'volcano' | 'ice' | 'space';
}

export const BattleStage: React.FC<BattleStageProps> = ({ children, theme }) => {
  const [bgUrl, setBgUrl] = useState('');

  useEffect(() => {
    fetchAnimeWallpaper().then(setBgUrl);
  }, [theme]);

  const themeColors = {
    forest: 'from-green-900/50 to-emerald-900/80',
    volcano: 'from-red-900/50 to-orange-900/80',
    ice: 'from-blue-900/50 to-cyan-900/80',
    space: 'from-purple-900/50 to-black/80'
  };

  return (
    <div 
      className="absolute inset-0 overflow-hidden bg-cover bg-center transition-all duration-1000 bg-slate-900"
      style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : undefined }}
    >
      {/* Atmosphere filter tints the anime wallpaper to fit the elemental stage theme */}
      <div className={`absolute inset-0 bg-gradient-to-t ${themeColors[theme]} mix-blend-multiply`}></div>
      
      {/* Weather/Particle simulation (basic CSS) */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,rgba(255,255,255,0.8)_2px,transparent_2px)] bg-[length:50px_50px] animate-[slide_10s_linear_infinite]"></div>

      {/* 2.5D Stage Floor Setup */}
      <div className="absolute inset-0 flex items-center justify-center perspective-stage">
        {/* Floor grid/texture */}
        <div className="w-[150%] h-[150%] absolute top-1/2 left-[-25%] stage-floor bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:50px_50px] border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.8)_inset]">
           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
        </div>

        {/* Actors layer (Cards) */}
        <div className="relative z-10 w-full max-w-5xl flex justify-between items-center px-12 pb-32">
          {children}
        </div>
      </div>
      
      <style>{`
        @keyframes slide {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
      `}</style>
    </div>
  );
};
