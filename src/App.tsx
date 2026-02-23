/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCrazyEights } from './hooks/useCrazyEights';
import { Card } from './components/Card';
import { Suit, Rank } from './types';
import { Heart, Diamond, Club, Spade, RefreshCw, Trophy, AlertCircle } from 'lucide-react';

export default function App() {
  const { state, initGame, isPlayable, playCard, chooseSuit, drawCard } = useCrazyEights();

  useEffect(() => {
    initGame();
  }, [initGame]);

  const topCard = state.discardPile[state.discardPile.length - 1];

  return (
    <div className="relative w-full h-screen felt-texture overflow-hidden flex flex-col">
      {/* Header / Stats */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-serif italic font-bold text-yellow-400 drop-shadow-lg">Tina 疯狂 8 点</h1>
          <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono tracking-wider uppercase">
            {state.turn === 'player' ? "你的回合" : "AI 正在思考..."}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
            <span className="text-xs uppercase opacity-60">牌堆</span>
            <span className="font-mono font-bold text-xl">{state.deck.length}</span>
          </div>
          <button 
            onClick={() => initGame()}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/10"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* AI Hand */}
      <div className="h-32 sm:h-48 flex items-start justify-center pt-16 px-4 z-20">
        <div className="relative flex justify-center w-full max-w-4xl">
          {state.aiHand.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ y: -100, opacity: 0 }}
              animate={{ 
                x: (index - (state.aiHand.length - 1) / 2) * Math.min(30, 400 / state.aiHand.length),
                y: 0,
                opacity: 1,
                rotate: (index - (state.aiHand.length - 1) / 2) * 2
              }}
              className="absolute"
              style={{ zIndex: index }}
            >
              <Card card={card} isFaceUp={false} className="scale-75 sm:scale-90 origin-top" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Center Table */}
      <div className="flex-1 flex items-center justify-center gap-6 sm:gap-20 relative z-10">
        {/* Draw Pile */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-yellow-400/0 group-hover:bg-yellow-400/5 rounded-2xl transition-colors" />
          <div 
            onClick={() => state.turn === 'player' && state.status === 'playing' && drawCard(true)}
            className={`
              relative cursor-pointer transition-transform active:scale-95
              ${state.turn === 'player' && state.status === 'playing' ? 'hover:-translate-y-1' : 'opacity-50 cursor-not-allowed'}
            `}
          >
            {/* Stack effect */}
            {[...Array(Math.min(3, state.deck.length))].map((_, i) => (
              <div 
                key={i}
                className="absolute bg-blue-900 border-2 border-white rounded-xl w-24 h-36 sm:w-28 sm:h-40 card-shadow"
                style={{ top: -i * 2, left: -i * 2, zIndex: -i }}
              />
            ))}
            <Card card={state.deck[0] || { id: 'back', suit: Suit.SPADES, rank: Rank.ACE }} isFaceUp={false} />
            
            {state.turn === 'player' && state.status === 'playing' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -bottom-8 left-0 right-0 text-center text-[10px] uppercase tracking-widest font-bold text-yellow-400 whitespace-nowrap"
              >
                点击摸牌
              </motion.div>
            )}
          </div>
        </div>

        {/* Discard Pile */}
        <div className="relative flex items-center justify-center w-24 h-36 sm:w-28 sm:h-40">
          <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-xl" />
          <AnimatePresence mode="popLayout">
            {state.discardPile.slice(-3).map((card, index, arr) => (
              <motion.div
                key={card.id}
                initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: index === arr.length - 1 ? 1 : 0.5,
                  rotate: (index - arr.length + 1) * 5 + (parseInt(card.id.length.toString()) % 10 - 5)
                }}
                className="absolute"
                style={{ zIndex: index }}
              >
                <Card card={card} />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Current Suit Indicator */}
          {state.currentSuit && (
            <motion.div 
              initial={{ scale: 0, x: 20, y: -20 }}
              animate={{ scale: 1, x: 0, y: 0 }}
              className="absolute -top-14 -right-14 w-14 h-14 sm:w-16 sm:h-16 bg-black/40 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center shadow-2xl z-50"
            >
              <div className="flex flex-col items-center">
                <span className="text-[7px] sm:text-[8px] uppercase tracking-tighter opacity-50 mb-0.5">花色</span>
                {state.currentSuit === Suit.HEARTS && <Heart className="fill-red-600 text-red-600" size={20} />}
                {state.currentSuit === Suit.DIAMONDS && <Diamond className="fill-red-600 text-red-600" size={20} />}
                {state.currentSuit === Suit.CLUBS && <Club className="fill-white text-white" size={20} />}
                {state.currentSuit === Suit.SPADES && <Spade className="fill-white text-white" size={20} />}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Player Hand */}
      <div className="h-48 sm:h-64 flex items-end justify-center pb-8 px-4 z-20">
        <div className="relative flex justify-center w-full max-w-5xl h-40">
          {state.playerHand.map((card, index) => {
            const playable = state.turn === 'player' && isPlayable(card);
            return (
              <motion.div
                key={card.id}
                initial={{ y: 100, opacity: 0 }}
                animate={{ 
                  x: (index - (state.playerHand.length - 1) / 2) * (state.playerHand.length > 10 ? 35 : 50),
                  y: playable ? -10 : 0,
                  opacity: 1,
                  rotate: (index - (state.playerHand.length - 1) / 2) * (state.playerHand.length > 10 ? 1 : 2),
                  zIndex: index
                }}
                className="absolute bottom-0"
              >
                <Card 
                  card={card} 
                  isPlayable={playable}
                  onClick={() => playCard(card, true)}
                  className={!playable && state.turn === 'player' ? 'opacity-60 grayscale-[0.3]' : ''}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Suit Picker Overlay */}
      <AnimatePresence>
        {state.status === 'choosing_suit' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl"
            >
              <h2 className="text-3xl font-serif italic mb-2 text-yellow-400">万能 8 点！</h2>
              <p className="text-white/60 mb-8 text-sm uppercase tracking-widest">选择接下来的花色</p>
              
              <div className="grid grid-cols-2 gap-4">
                {[Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES].map((suit) => (
                  <button
                    key={suit}
                    onClick={() => chooseSuit(suit)}
                    className="flex flex-col items-center justify-center p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group active:scale-95"
                  >
                    {suit === Suit.HEARTS && <Heart size={48} className="fill-red-600 text-red-600 group-hover:scale-110 transition-transform" />}
                    {suit === Suit.DIAMONDS && <Diamond size={48} className="fill-red-600 text-red-600 group-hover:scale-110 transition-transform" />}
                    {suit === Suit.CLUBS && <Club size={48} className="fill-white text-white group-hover:scale-110 transition-transform" />}
                    {suit === Suit.SPADES && <Spade size={48} className="fill-white text-white group-hover:scale-110 transition-transform" />}
                    <span className="mt-3 text-xs uppercase tracking-widest font-bold opacity-40 group-hover:opacity-100 transition-opacity">
                      {suit === Suit.HEARTS && "红心"}
                      {suit === Suit.DIAMONDS && "方块"}
                      {suit === Suit.CLUBS && "梅花"}
                      {suit === Suit.SPADES && "黑桃"}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {state.status === 'game_over' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center"
            >
              <div className="mb-6 flex justify-center">
                {state.winner === 'player' ? (
                  <div className="relative">
                    <motion.div 
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Trophy size={120} className="text-yellow-400" />
                    </motion.div>
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl -z-10"
                    />
                  </div>
                ) : (
                  <AlertCircle size={120} className="text-red-500" />
                )}
              </div>
              
              <h2 className="text-6xl font-serif italic mb-2 text-white">
                {state.winner === 'player' ? "胜利！" : "失败..."}
              </h2>
              <p className="text-white/40 mb-12 uppercase tracking-[0.3em] text-sm">
                {state.winner === 'player' ? "你率先清空了手牌" : "这次 AI 技高一筹"}
              </p>
              
              <button
                onClick={() => initGame()}
                className="px-12 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-xl"
              >
                再玩一次
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Hint */}
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none sm:hidden">
        <p className="text-[10px] uppercase tracking-widest opacity-30">滑动或点击卡牌进行出牌</p>
      </div>
    </div>
  );
}
