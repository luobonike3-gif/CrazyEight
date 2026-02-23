
import React from 'react';
import { motion } from 'motion/react';
import { Card as CardType, Suit, Rank } from '../types';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface CardProps {
  card: CardType;
  isFaceUp?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
}

const SuitIcon = ({ suit, size = 20 }: { suit: Suit; size?: number }) => {
  switch (suit) {
    case Suit.HEARTS: return <Heart size={size} className="fill-red-600 text-red-600" />;
    case Suit.DIAMONDS: return <Diamond size={size} className="fill-red-600 text-red-600" />;
    case Suit.CLUBS: return <Club size={size} className="fill-slate-900 text-slate-900" />;
    case Suit.SPADES: return <Spade size={size} className="fill-slate-900 text-slate-900" />;
  }
};

export const Card: React.FC<CardProps> = ({ 
  card, 
  isFaceUp = true, 
  onClick, 
  isPlayable = false,
  className = ""
}) => {
  const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;

  return (
    <motion.div
      layoutId={card.id}
      whileHover={isPlayable ? { y: -20, scale: 1.05 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative w-24 h-36 sm:w-28 sm:h-40 rounded-xl cursor-pointer select-none
        transition-shadow duration-200 card-shadow
        ${isPlayable ? 'ring-4 ring-yellow-400/50' : ''}
        ${!isFaceUp ? 'bg-blue-800 border-4 border-white' : 'bg-white border border-gray-200'}
        ${className}
      `}
    >
      {!isFaceUp ? (
        <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
          <div className="w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <div className="absolute inset-2 border-2 border-white/30 rounded-md flex items-center justify-center">
            <div className="text-white/40 font-serif italic text-xl">Tina</div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full p-2 flex flex-col justify-between text-slate-900">
          <div className="flex flex-col items-start leading-none">
            <span className={`text-xl font-bold ${isRed ? 'text-red-600' : ''}`}>{card.rank}</span>
            <SuitIcon suit={card.suit} size={14} />
          </div>
          
          <div className="flex justify-center items-center">
            <SuitIcon suit={card.suit} size={32} />
          </div>
          
          <div className="flex flex-col items-end leading-none rotate-180">
            <span className={`text-xl font-bold ${isRed ? 'text-red-600' : ''}`}>{card.rank}</span>
            <SuitIcon suit={card.suit} size={14} />
          </div>
        </div>
      )}
    </motion.div>
  );
};
