import React, { useState } from 'react';
import { 
  Smile, Zap, Swords, Users, MessageSquare, Anchor, Lightbulb, 
  TrendingUp, Award, HelpCircle, Eye, Flag, Map, Compass, ShieldAlert
} from 'lucide-react';

interface ActivityIllustrationProps {
  id: number | string;
  name: string;
  category: string;
  illustrationUrl?: string;
  className?: string;
  isHero?: boolean;
}

// Map categories to high-quality UI gradients and custom Lucide icons
const CATEGORY_MAP: { [key: string]: { gradient: string; icon: React.ComponentType<any>; color: string; patternColor: string } } = {
  "Ice Breaking": {
    gradient: "from-amber-400 to-orange-500",
    icon: Smile,
    color: "text-amber-100",
    patternColor: "rgba(251, 146, 60, 0.2)"
  },
  "Energizer": {
    gradient: "from-rose-400 via-pink-500 to-red-500",
    icon: Zap,
    color: "text-rose-100",
    patternColor: "rgba(244, 63, 94, 0.2)"
  },
  "Fun Games": {
    gradient: "from-yellow-400 to-amber-500",
    icon: Swords,
    color: "text-yellow-100",
    patternColor: "rgba(245, 158, 11, 0.2)"
  },
  "Team Building": {
    gradient: "from-blue-400 to-indigo-600",
    icon: Users,
    color: "text-blue-100",
    patternColor: "rgba(79, 70, 229, 0.2)"
  },
  "Communication": {
    gradient: "from-teal-400 to-emerald-600",
    icon: MessageSquare,
    color: "text-teal-100",
    patternColor: "rgba(5, 150, 105, 0.2)"
  },
  "Leadership": {
    gradient: "from-indigo-500 via-purple-600 to-violet-700",
    icon: Anchor,
    color: "text-purple-100",
    patternColor: "rgba(124, 58, 237, 0.2)"
  },
  "Problem Solving": {
    gradient: "from-cyan-400 to-blue-600",
    icon: Lightbulb,
    color: "text-cyan-100",
    patternColor: "rgba(37, 99, 235, 0.2)"
  },
  "Sales & Service": {
    gradient: "from-emerald-400 to-teal-500",
    icon: TrendingUp,
    color: "text-emerald-100",
    patternColor: "rgba(16, 185, 129, 0.2)"
  },
  "Quiz & Polling": {
    gradient: "from-violet-400 to-fuchsia-600",
    icon: HelpCircle,
    color: "text-violet-100",
    patternColor: "rgba(192, 38, 211, 0.2)"
  },
  "Simulation & Role Play": {
    gradient: "from-purple-400 to-pink-600",
    icon: Eye,
    color: "text-purple-100",
    patternColor: "rgba(219, 39, 119, 0.2)"
  },
  "Challenge": {
    gradient: "from-red-400 via-orange-500 to-amber-500",
    icon: Award,
    color: "text-red-100",
    patternColor: "rgba(239, 68, 68, 0.2)"
  },
  "Reflection": {
    gradient: "from-slate-700 to-slate-900",
    icon: Flag,
    color: "text-slate-100",
    patternColor: "rgba(148, 163, 184, 0.15)"
  },
  "Travel & Special": {
    gradient: "from-sky-400 to-indigo-500",
    icon: Map,
    color: "text-sky-100",
    patternColor: "rgba(14, 165, 233, 0.2)"
  }
};

const DEFAULT_STYLE = {
  gradient: "from-slate-400 to-slate-600",
  icon: Compass,
  color: "text-white",
  patternColor: "rgba(255,255,255,0.1)"
};

// Simple hash utility to generate unique offsets/rotations based on id and name
function generateSeed(id: number | string, name: string) {
  const numericId = typeof id === 'number' ? id : parseInt(id.replace(/\D/g, '')) || 42;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return {
    angle: Math.abs(hash % 360),
    scale: 0.8 + (Math.abs(hash % 4) * 0.1),
    offsetY: (hash % 15),
    offsetX: ((hash >> 2) % 30) - 15,
    styleVariant: Math.abs(hash % 3), // geometric styles
    seedValue: numericId
  };
}

export default function ActivityIllustration({ 
  id, 
  name, 
  category, 
  illustrationUrl, 
  className = "w-full h-full",
  isHero = false 
}: ActivityIllustrationProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get matching style definitions
  const info = CATEGORY_MAP[category] || DEFAULT_STYLE;
  const IconComponent = info.icon;

  // Generate unique seed specifications for geometric variations
  const seed = generateSeed(id, name);

  // Vector / SVG Tactical pitch generator
  const renderTacticalSvg = () => {
    const isBig = isHero;
    const centerSize = isBig ? (imageError ? 100 : 70) : 48;
    const ringRadius = isBig ? 90 : 50;

    return (
      <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${info.gradient} flex items-center justify-center overflow-hidden border-b border-white/10`}>
        {/* Abstract vector styling grid lines (Whiteboard tactics style with X's and O's) */}
        <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
          {/* Pitch boundary and lines */}
          <rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="white" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="50%" y1="5%" x2="50%" y2="95%" stroke="white" strokeWidth="1" />
          <circle cx="50%" cy="50%" r={ringRadius} fill="none" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
          
          {/* Unique dynamic lines derived from seed */}
          {seed.styleVariant === 0 && (
            <>
              {/* Passing tactical arrows */}
              <path d={`M 30 ${60 + seed.offsetY} Q ${100 + seed.offsetX} ${30 + seed.offsetY} 170 ${110 - seed.offsetY}`} fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="5" />
              <polygon points="166,104 172,111 163,112" fill="white" />
              {/* Team markers */}
              <text x="35" y="55" fill="white" fontSize="12" fontWeight="bold" fontFamily="monospace">X1</text>
              <text x="175" y="125" fill="white" fontSize="12" fontWeight="bold" fontFamily="monospace">O1</text>
            </>
          )}

          {seed.styleVariant === 1 && (
            <>
              {/* Loop track */}
              <rect x="25%" y="25%" width="50%" height="50%" rx="15" fill="none" stroke="white" strokeWidth="1.2" />
              <circle cx="25%" cy="50%" r="5" fill="white" />
              <circle cx="75%" cy="30%" r="6" fill="none" stroke="white" strokeWidth="1.5" />
              <text x="72%" y="26%" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">START</text>
            </>
          )}

          {seed.styleVariant === 2 && (
            <>
              {/* Radar rings */}
              <circle cx="30%" cy="70%" r="40" fill="none" stroke="white" strokeWidth="0.8" />
              <circle cx="30%" cy="70%" r="20" fill="none" stroke="white" strokeWidth="0.5" />
              <line x1="10%" y1="70%" x2="50%" y2="70%" stroke="white" strokeWidth="0.8" />
              <line x1="30%" y1="50%" x2="30%" y2="90%" stroke="white" strokeWidth="0.8" />
            </>
          )}

          {/* Dotted background overlay */}
          <defs>
            <pattern id={`dot-grid-${id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="rgba(255, 255, 255, 0.2)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#dot-grid-${id})`} />
        </svg>

        {/* Dynamic Abstract Floating background shapes to guarantee 100% uniqueness */}
        <div 
          style={{
            transform: `rotate(${seed.angle}deg) scale(${seed.scale}) translate(${seed.offsetX}px, ${seed.offsetY}px)`,
            transition: 'transform 0.4s ease-out'
          }}
          className="absolute inset-0 bg-white/5 rounded-full pointer-events-none filter blur-xl w-32 h-32 md:w-36 md:h-36 -top-10 -left-10"
        />

        {/* Center Iconic Element */}
        <div 
          style={{
            transform: `translate(${seed.offsetX / 2}px, ${seed.offsetY / 2}px)`
          }}
          className="relative z-10 flex flex-col items-center justify-center p-4 text-center transition-all duration-350"
        >
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <IconComponent style={{ width: centerSize, height: centerSize }} className={`${info.color} drop-shadow-md`} />
          </div>
          {isBig && (
            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-widest text-white/50 uppercase font-mono bg-black/10 px-2 py-0.5 rounded-full border border-white/5">
                KAMPUS AKTIPAN ILUSTRASI
              </span>
              <h4 className="text-sm font-extrabold text-white font-mono tracking-tight max-w-xs truncate-2-lines line-clamp-2 px-4 shadow-sm">
                {name}
              </h4>
            </div>
          )}
        </div>

        {/* Subtle decorative category stamp */}
        <div className="absolute bottom-2 right-3 z-10">
          <span className="text-[9px] font-black uppercase font-mono text-white/40 tracking-widest tracking-wide">
            {category}
          </span>
        </div>
      </div>
    );
  };

  // If there's an illustration URL and no image error occurred yet, render the img
  if (illustrationUrl && !imageError) {
    return (
      <div className={`relative ${className} bg-slate-950 overflow-hidden`}>
        {/* Placeholder gradient showing while the main image compiles/loads */}
        {!imageLoaded && renderTacticalSvg()}

        <img 
          src={illustrationUrl} 
          alt={name}
          className={`w-full h-full object-cover transition-all duration-500 select-none ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          onError={() => setImageError(true)}
          onLoad={() => setImageLoaded(true)}
          referrerPolicy="no-referrer"
        />
        
        {/* Elegant layout backdrop scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent pointer-events-none" />
      </div>
    );
  }

  // Fallback placeholder
  return (
    <div className={`relative ${className} overflow-hidden`}>
      {renderTacticalSvg()}
    </div>
  );
}
