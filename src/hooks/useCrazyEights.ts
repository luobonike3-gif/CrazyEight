
import { useState, useCallback, useEffect } from 'react';
import { Card, Suit, Rank, GameState, GameStatus } from '../types';
import { createDeck, shuffleDeck, INITIAL_HAND_SIZE } from '../constants';

export const useCrazyEights = () => {
  const [state, setState] = useState<GameState>({
    deck: [],
    playerHand: [],
    aiHand: [],
    discardPile: [],
    currentSuit: null,
    turn: 'player',
    status: 'playing',
    winner: null,
  });

  const initGame = useCallback(() => {
    const fullDeck = shuffleDeck(createDeck());
    const playerHand = fullDeck.splice(0, INITIAL_HAND_SIZE);
    const aiHand = fullDeck.splice(0, INITIAL_HAND_SIZE);
    
    // Find a non-8 card for the start of discard pile
    let firstCardIndex = fullDeck.findIndex(c => c.rank !== Rank.EIGHT);
    if (firstCardIndex === -1) firstCardIndex = 0;
    const firstCard = fullDeck.splice(firstCardIndex, 1)[0];

    setState({
      deck: fullDeck,
      playerHand,
      aiHand,
      discardPile: [firstCard],
      currentSuit: firstCard.suit,
      turn: 'player',
      status: 'playing',
      winner: null,
    });
  }, []);

  const isPlayable = useCallback((card: Card) => {
    if (state.status !== 'playing') return false;
    const topCard = state.discardPile[state.discardPile.length - 1];
    
    // 8 is always playable
    if (card.rank === Rank.EIGHT) return true;
    
    // Match rank or current suit
    return card.rank === topCard.rank || card.suit === state.currentSuit;
  }, [state.discardPile, state.currentSuit, state.status]);

  const playCard = useCallback((card: Card, isPlayer: boolean) => {
    const targetHand = isPlayer ? 'playerHand' : 'aiHand';
    const nextTurn = isPlayer ? 'ai' : 'player';

    setState(prev => {
      const newHand = prev[targetHand].filter(c => c.id !== card.id);
      const newDiscardPile = [...prev.discardPile, card];
      
      // Check for win
      if (newHand.length === 0) {
        return {
          ...prev,
          [targetHand]: newHand,
          discardPile: newDiscardPile,
          status: 'game_over',
          winner: isPlayer ? 'player' : 'ai',
        };
      }

      // If 8 is played
      if (card.rank === Rank.EIGHT) {
        return {
          ...prev,
          [targetHand]: newHand,
          discardPile: newDiscardPile,
          status: isPlayer ? 'choosing_suit' : 'playing',
          // AI chooses suit immediately (logic below)
          currentSuit: isPlayer ? prev.currentSuit : null, 
          turn: isPlayer ? 'player' : nextTurn,
        };
      }

      return {
        ...prev,
        [targetHand]: newHand,
        discardPile: newDiscardPile,
        currentSuit: card.suit,
        turn: nextTurn,
      };
    });
  }, []);

  const chooseSuit = useCallback((suit: Suit) => {
    setState(prev => ({
      ...prev,
      currentSuit: suit,
      status: 'playing',
      turn: 'ai',
    }));
  }, []);

  const drawCard = useCallback((isPlayer: boolean) => {
    setState(prev => {
      if (prev.deck.length === 0) {
        // Skip turn if deck is empty
        return { ...prev, turn: isPlayer ? 'ai' : 'player' };
      }

      const newDeck = [...prev.deck];
      const card = newDeck.pop()!;
      const targetHand = isPlayer ? 'playerHand' : 'aiHand';
      const newHand = [...prev[targetHand], card];

      // Check if the drawn card is playable immediately
      // In some variations you can play it, in others you just end turn.
      // Let's go with: if playable, player can still play it. If not, turn continues?
      // Actually, standard rules: draw one, if you can't play, turn ends.
      // But let's allow the player to draw until they have a playable card or just draw once.
      // Coolmathgames version: Draw once. If still can't play, skip.
      
      const canPlayDrawn = (card.rank === Rank.EIGHT || card.rank === prev.discardPile[prev.discardPile.length - 1].rank || card.suit === prev.currentSuit);

      // If player draws and still can't play, we should probably auto-pass or let them try to play.
      // Let's keep it simple: draw once, turn passes if not playable.
      
      if (!canPlayDrawn) {
        return {
          ...prev,
          deck: newDeck,
          [targetHand]: newHand,
          turn: isPlayer ? 'ai' : 'player',
        };
      }

      return {
        ...prev,
        deck: newDeck,
        [targetHand]: newHand,
      };
    });
  }, []);

  // AI Logic
  useEffect(() => {
    if (state.turn === 'ai' && state.status === 'playing' && !state.winner) {
      const timer = setTimeout(() => {
        const playableCards = state.aiHand.filter(isPlayable);
        
        if (playableCards.length > 0) {
          // AI Strategy: Play highest rank or keep 8s for later?
          // Simple: Play first available non-8, or an 8 if nothing else.
          const nonEight = playableCards.find(c => c.rank !== Rank.EIGHT);
          const cardToPlay = nonEight || playableCards[0];
          
          if (cardToPlay.rank === Rank.EIGHT) {
            // AI chooses most frequent suit in hand
            const suitCounts: Record<string, number> = {};
            state.aiHand.forEach(c => {
              suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
            });
            const bestSuit = (Object.keys(suitCounts).sort((a, b) => suitCounts[b] - suitCounts[a])[0] as Suit) || Suit.HEARTS;
            
            // Execute play and suit choice
            playCard(cardToPlay, false);
            setState(prev => ({ ...prev, currentSuit: bestSuit, turn: 'player' }));
          } else {
            playCard(cardToPlay, false);
          }
        } else {
          // AI must draw
          if (state.deck.length > 0) {
            drawCard(false);
          } else {
            // Skip turn
            setState(prev => ({ ...prev, turn: 'player' }));
          }
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.turn, state.status, state.aiHand, isPlayable, playCard, drawCard, state.deck.length, state.winner]);

  return {
    state,
    initGame,
    isPlayable,
    playCard,
    chooseSuit,
    drawCard,
  };
};
