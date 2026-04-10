import { Values } from './Card.js';

export class Scoring {
    /**
     * Gets the numeric value of a card for scoring 15s (face cards are 10, Ace is 1).
     * @param {import('./Card.js').Card} card
     * @returns {number}
     */
    static getCardValue(card) {
        const rank = card.getRank();
        return rank > 10 ? 10 : rank;
    }

    /**
     * Counts the total points for a hand or crib.
     * @param {import('./Card.js').Card[]} cards - The 4 cards in hand + 1 starter card.
     * @param {import('./Card.js').Card} starterCard - The cut card.
     * @param {boolean} isCrib - Whether this is the dealer's crib (affects flushes).
     * @returns {Object} breakdown of points
     */
    static countHand(cards, starterCard, isCrib = false) {
        const allCards = [...cards, starterCard];
        
        const fifteenPoints = this.checkFifteens(allCards);
        const pairPoints = this.checkPairs(allCards);
        const runPoints = this.checkRuns(allCards);
        const flushPoints = this.checkFlush(cards, starterCard, isCrib);
        const nobPoints = this.checkNobs(cards, starterCard);

        return {
            fifteens: fifteenPoints,
            pairs: pairPoints,
            runs: runPoints,
            flush: flushPoints,
            nobs: nobPoints,
            total: fifteenPoints + pairPoints + runPoints + flushPoints + nobPoints
        };
    }

    /**
     * Finds all combinations of cards that sum to 15.
     * @param {import('./Card.js').Card[]} cards
     * @returns {number} points (2 per fifteen)
     */
    static checkFifteens(cards) {
        let count = 0;
        
        const findCombinations = (startIndex, currentSum) => {
            for (let i = startIndex; i < cards.length; i++) {
                const nextSum = currentSum + this.getCardValue(cards[i]);
                if (nextSum === 15) {
                    count++;
                } else if (nextSum < 15) {
                    findCombinations(i + 1, nextSum);
                }
            }
        };

        findCombinations(0, 0);
        return count * 2;
    }

    /**
     * Counts points for pairs (2 points), triplets (6 points), and quads (12 points).
     * @param {import('./Card.js').Card[]} cards
     * @returns {number} total pair points
     */
    static checkPairs(cards) {
        let points = 0;
        const counts = {};
        
        for (const card of cards) {
            counts[card.value] = (counts[card.value] || 0) + 1;
        }

        for (const val in counts) {
            const n = counts[val];
            if (n === 2) points += 2;      // 1 pair
            else if (n === 3) points += 6; // 3 pairs (triplet)
            else if (n === 4) points += 12;// 6 pairs (quad)
        }
        
        return points;
    }

    /**
     * Counts points for runs of 3 or more consecutive ranks.
     * @param {import('./Card.js').Card[]} cards
     * @returns {number} total run points
     */
    static checkRuns(cards) {
        const ranks = cards.map(c => c.getRank()).sort((a, b) => a - b);
        
        // Find the longest run(s)
        // In Cribbage, we count the total number of unique runs.
        // If we have 3-4-5-5, that's two runs of 3 (3-4-5 and 3-4-5).
        
        let totalPoints = 0;
        
        // Using a more robust approach for multipliers (double/triple runs)
        const rankCounts = {};
        ranks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1);
        
        const uniqueRanks = Object.keys(rankCounts).map(Number).sort((a, b) => a - b);
        
        let i = 0;
        while (i < uniqueRanks.length) {
            let run = [uniqueRanks[i]];
            let j = i + 1;
            while (j < uniqueRanks.length && uniqueRanks[j] === uniqueRanks[j - 1] + 1) {
                run.push(uniqueRanks[j]);
                j++;
            }
            
            if (run.length >= 3) {
                // We found a run of length run.length
                // Now multiply by the frequencies of each rank in the run
                let multiplier = 1;
                for (const r of run) {
                    multiplier *= rankCounts[r];
                }
                totalPoints += run.length * multiplier;
                i = j; // Skip to the end of this run
            } else {
                i++;
            }
        }
        
        return totalPoints;
    }

    /**
     * Counts points for flushes.
     * @param {import('./Card.js').Card[]} handCards - The 4 cards in hand.
     * @param {import('./Card.js').Card} starterCard - The cut card.
     * @param {boolean} isCrib - Whether this is the crib.
     * @returns {number} flush points
     */
    static checkFlush(handCards, starterCard, isCrib) {
        if (!handCards || handCards.length === 0) return 0;
        const firstSuit = handCards[0].suit;
        const allHandSame = handCards.every(c => c.suit === firstSuit);
        
        if (!allHandSame) return 0;
        
        const starterMatches = starterCard.suit === firstSuit;
        
        if (isCrib) {
            // In the crib, all 5 cards must match
            return starterMatches ? 5 : 0;
        } else {
            // In hand, 4 cards matching is 4 points, 5 is 5 points
            return starterMatches ? 5 : 4;
        }
    }

    /**
     * Checks for "His Nob" (Jack in hand of same suit as starter).
     * @param {import('./Card.js').Card[]} handCards
     * @param {import('./Card.js').Card} starterCard
     * @returns {number} 1 if found, 0 otherwise
     */
    static checkNobs(handCards, starterCard) {
        for (const card of handCards) {
            if (card.value === Values.JACK && card.suit === starterCard.suit) {
                return 1;
            }
        }
        return 0;
    }

    /**
     * Calculates points for a card played during pegging.
     * @param {import('./Card.js').Card[]} playedCards - The sequence of cards played in the current "Go" cycle.
     * @param {number} currentTotal - The total value including the card just played.
     * @returns {number} points earned by the last played card
     */
    static countPegging(playedCards, currentTotal) {
        let points = 0;
        
        if (playedCards.length < 1) return 0;
        
        // 15s and 31s
        if (currentTotal === 15) points += 2;
        if (currentTotal === 31) points += 2;

        // Pairs (last 2, 3, or 4 cards)
        const lastCard = playedCards[playedCards.length - 1];
        let pairCount = 0;
        for (let i = playedCards.length - 2; i >= 0; i--) {
            if (playedCards[i].value === lastCard.value) {
                pairCount++;
            } else {
                break;
            }
        }
        if (pairCount === 1) points += 2;
        else if (pairCount === 2) points += 6;
        else if (pairCount === 3) points += 12;

        // Runs (last 3 or more cards in any order)
        // We check from longest possible run down to 3
        for (let len = playedCards.length; len >= 3; len--) {
            const subSet = playedCards.slice(playedCards.length - len);
            const ranks = subSet.map(c => c.getRank()).sort((a, b) => a - b);
            
            let isRun = true;
            for (let i = 1; i < ranks.length; i++) {
                if (ranks[i] !== ranks[i - 1] + 1) {
                    isRun = false;
                    break;
                }
            }
            
            if (isRun) {
                points += len;
                break; // Only the longest run counts in pegging
            }
        }

        return points;
    }
}
