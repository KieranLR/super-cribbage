export const Suits = {
    HEARTS: 'Hearts',
    DIAMONDS: 'Diamonds',
    CLUBS: 'Clubs',
    SPADES: 'Spades'
};

export const Values = {
    ACE: 'Ace',
    TWO: '2',
    THREE: '3',
    FOUR: '4',
    FIVE: '5',
    SIX: '6',
    SEVEN: '7',
    EIGHT: '8',
    NINE: '9',
    TEN: '10',
    JACK: 'Jack',
    QUEEN: 'Queen',
    KING: 'King'
};

export class Card {
    /**
     * @param {string} suit - Use values from Suits
     * @param {string} value - Use values from Values
     */
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }

    /**
     * Returns the numeric rank of the card (1-13).
     * @returns {number}
     */
    getRank() {
        const ranks = {
            [Values.ACE]: 1,
            [Values.TWO]: 2,
            [Values.THREE]: 3,
            [Values.FOUR]: 4,
            [Values.FIVE]: 5,
            [Values.SIX]: 6,
            [Values.SEVEN]: 7,
            [Values.EIGHT]: 8,
            [Values.NINE]: 9,
            [Values.TEN]: 10,
            [Values.JACK]: 11,
            [Values.QUEEN]: 12,
            [Values.KING]: 13
        };
        return ranks[this.value];
    }

    /**
     * Returns the display name of the card (e.g. "Ace of Spades")
     * @returns {string}
     */
    toString() {
        return `${this.value} of ${this.suit}`;
    }
}
