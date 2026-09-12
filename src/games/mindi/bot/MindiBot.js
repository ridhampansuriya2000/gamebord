import { getValidCards } from '../engine/trumpRules';
import { determineTrickWinner } from '../engine/trick';

// Simple heuristic bot for Mindi MVP
export const chooseBotCard = (gameState, botSeat) => {
  const hand = gameState.hands[botSeat];
  const currentTrick = gameState.currentTrick;
  
  const validCards = getValidCards(hand, currentTrick);
  
  if (validCards.length === 1) {
    return validCards[0];
  }

  // If leading a trick
  if (currentTrick.length === 0) {
    // Lead with a high card (Aces, Kings) of a non-trump suit, or just a random high card
    // Avoid leading 10s unless it's safe (which is hard to know). Let's avoid leading 10s.
    const nonTens = validCards.filter(c => c.rank !== '10');
    if (nonTens.length > 0) {
      // Pick highest non-10
      nonTens.sort((a, b) => b.value - a.value);
      return nonTens[0];
    }
    // If only 10s left, play one
    return validCards[0];
  }

  // If following
  const leadSuit = currentTrick[0].card.suit;
  const isTrumpRevealed = gameState.trumpRevealed;
  const trumpSuit = gameState.trumpSuit;

  // Evaluate current winning card
  const currentWinnerPlay = determineTrickWinner(currentTrick, trumpSuit, isTrumpRevealed);
  const currentWinnerSeat = currentWinnerPlay.seatIndex;
  
  // Team A: 0, 2. Team B: 1, 3
  const isPartnerWinning = (currentWinnerSeat % 2) === (botSeat % 2);
  
  const hasTensInTrick = currentTrick.some(p => p.card.rank === '10');

  // Try to win if partner is not winning and there are 10s
  // Try to throw 10 if partner IS winning
  
  if (isPartnerWinning) {
    // Partner is winning. Can we throw a 10?
    const myTens = validCards.filter(c => c.rank === '10');
    if (myTens.length > 0) {
       return myTens[0];
    }
    // Otherwise throw lowest card
    validCards.sort((a, b) => a.value - b.value);
    return validCards[0];
  } else {
    // Opponent is winning. Can we beat them?
    const beatingCards = validCards.filter(c => {
      const mockTrick = [...currentTrick, { seatIndex: botSeat, card: c }];
      const winner = determineTrickWinner(mockTrick, trumpSuit, isTrumpRevealed);
      return winner.seatIndex === botSeat;
    });

    if (beatingCards.length > 0) {
      // We can win! Play the lowest winning card to conserve high cards
      beatingCards.sort((a, b) => a.value - b.value);
      return beatingCards[0];
    } else {
      // We cannot win. Throw lowest card. Avoid throwing 10s if possible.
      const nonTens = validCards.filter(c => c.rank !== '10');
      if (nonTens.length > 0) {
        nonTens.sort((a, b) => a.value - b.value);
        return nonTens[0];
      }
      return validCards[0];
    }
  }
};
