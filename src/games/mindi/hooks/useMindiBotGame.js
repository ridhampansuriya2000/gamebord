import { useState, useEffect, useRef } from 'react';
import { createDeck, shuffleDeck, dealCards } from '../engine/cards';
import { isValidCardPlay } from '../engine/trumpRules';
import { determineTrickWinner, getCapturedMindis } from '../engine/trick';
import { getTeamForSeat, getNextTurn, determineRoundWinner, createInitialGameState } from '../engine/game';
import { chooseBotCard } from '../bot/MindiBot';

export const useMindiBotGame = () => {
  const [gameState, setGameState] = useState(null);
  const [botActionMessage, setBotActionMessage] = useState('');
  
  const stateRef = useRef(null);

  const syncState = (newState) => {
    setGameState({ ...newState });
    stateRef.current = newState;
  };

  const startGame = () => {
    const deck = shuffleDeck(createDeck());
    const hands = dealCards(deck, 4, 13);
    
    const initial = createInitialGameState();
    initial.hands = hands;
    initial.dealer = 0;
    initial.currentTurn = 1; // Dealer's left starts (Player 1, Bot)
    initial.status = 'selecting_trump'; // Need to hide trump
    
    syncState(initial);
  };

  const resetGame = () => {
    startGame();
  };

  const setTrump = (cardId, seatIndex) => {
    const state = stateRef.current;
    if (state.status !== 'selecting_trump') return;
    if (state.currentTurn !== seatIndex) return;

    const hand = state.hands[seatIndex];
    const cardIndex = hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = hand.splice(cardIndex, 1)[0];
    
    state.trumpCard = { card, seatIndex };
    state.trumpSuit = card.suit;
    state.trumpRevealed = false;
    state.status = 'playing';
    
    syncState(state);
  };

  const revealTrump = () => {
    const state = stateRef.current;
    if (state.status !== 'playing' || state.trumpRevealed) return;
    
    state.trumpRevealed = true;
    if (state.trumpCard) {
      state.hands[state.trumpCard.seatIndex].push(state.trumpCard.card);
    }
    syncState(state);
  };

  const playCard = (cardId, seatIndex) => {
    const state = stateRef.current;
    if (state.status !== 'playing') return;
    if (state.currentTurn !== seatIndex) return;

    const hand = state.hands[seatIndex];
    
    if (!isValidCardPlay(cardId, hand, state.currentTrick)) return;

    const cardIndex = hand.findIndex(c => c.id === cardId);
    const card = hand.splice(cardIndex, 1)[0];

    state.currentTrick.push({ seatIndex, card });
    state.playedCards.push(card);

    if (state.currentTrick.length < 4) {
      state.currentTurn = getNextTurn(state.currentTurn);
      syncState(state);
    } else {
      state.status = 'trick_complete';
      syncState(state);
      
      setTimeout(() => {
        const winningPlay = determineTrickWinner(state.currentTrick, state.trumpSuit, state.trumpRevealed);
        const winningSeat = winningPlay.seatIndex;
        const winningTeam = getTeamForSeat(winningSeat);

        const mindis = getCapturedMindis(state.currentTrick);
        state.capturedMindis[winningTeam].push(...mindis);
        state.tricksWon[winningTeam]++;

        state.currentTrick = [];
        state.currentTurn = winningSeat;

        if (state.playedCards.length === 52 || (state.playedCards.length === 51 && !state.trumpRevealed)) {
           if (!state.trumpRevealed && state.trumpCard) {
               if (state.trumpCard.card.rank === '10') {
                   state.capturedMindis[winningTeam].push(state.trumpCard.card);
               }
           }
           state.status = 'finished';
           state.winner = determineRoundWinner(state.tricksWon, state.capturedMindis);
        } else {
           state.status = 'playing';
           if (state.hands[state.currentTurn].length === 0 && !state.trumpRevealed) {
               state.trumpRevealed = true;
               if (state.trumpCard) {
                   state.hands[state.trumpCard.seatIndex].push(state.trumpCard.card);
               }
           }
        }
        syncState(state);
      }, 1500);
    }
  };

  // Bot logic runner
  useEffect(() => {
    if (!gameState) return;
    
    const state = stateRef.current;
    
    if (state.status === 'selecting_trump') {
      if (state.currentTurn !== 0) { // If it's a bot's turn to pick trump
        setTimeout(() => {
           // Bot randomly picks a card as trump
           const hand = state.hands[state.currentTurn];
           const randomCard = hand[Math.floor(Math.random() * hand.length)];
           setTrump(randomCard.id, state.currentTurn);
        }, 800);
      }
      return;
    }

    if (state.status === 'playing' && state.currentTurn !== 0) {
      const botSeat = state.currentTurn;
      setBotActionMessage(`Player ${botSeat + 1} is thinking...`);
      
      const delay = Math.floor(Math.random() * 1000) + 800;
      
      const timer = setTimeout(() => {
        const stateNow = stateRef.current;
        if (stateNow.status !== 'playing' || stateNow.currentTurn !== botSeat) return;
        
        // Bot might want to reveal trump if they can't follow suit and it's not revealed
        if (!stateNow.trumpRevealed && stateNow.currentTrick.length > 0) {
          const leadSuit = stateNow.currentTrick[0].card.suit;
          const hasLead = stateNow.hands[botSeat].some(c => c.suit === leadSuit);
          if (!hasLead) {
             // Bot reveals trump!
             revealTrump();
             return; // Wait for next render cycle to actually play the card
          }
        }

        const chosenCard = chooseBotCard(stateNow, botSeat);
        if (chosenCard) {
          playCard(chosenCard.id, botSeat);
        }
        setBotActionMessage('');
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [gameState?.status, gameState?.currentTurn, gameState?.trumpRevealed]);

  return {
    gameState,
    startGame,
    resetGame,
    playCard: (cardId) => playCard(cardId, 0), // Human is always seat 0
    setTrump: (cardId) => setTrump(cardId, 0),
    revealTrump,
    botActionMessage
  };
};
