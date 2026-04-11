export const CARD_DECKS = {
    DEFAULT: {
        id: 'default',
        name: 'Classic Blue',
        colors: {
            FACE_UP_BG: 0xffffff,
            FACE_DOWN_BG: 0x9C6615,
            FACE_DOWN_PATTERN: 0xB5CA8D,
            FACE_UP_STROKE: 0x888888,
            FACE_DOWN_STROKE: 0x222E50,
            HOVER_STROKE: 0x028af8,
            SELECTED_STROKE: 0xffd700,
            SUITS: {
                'Hearts': '#ff0000',
                'Diamonds': '#ff8c00',
                'Clubs': '#00008b',
                'Spades': '#000000'
            },
            TEXT_DEFAULT: '#000000'
        },
        style: {
            STROKE_WIDTH_FACE_UP: 2,
            STROKE_WIDTH_FACE_DOWN: 2,
            STROKE_WIDTH_HOVER: 4,
            STROKE_WIDTH_SELECTED: 4,
            HOVER_OFFSET: 10
        },
        dimensions: {
            WIDTH: 100,
            HEIGHT: 140,
            CORNER_RADIUS: 0,
            GRID_SIZE: 15
        }
    },
    MODERN_RED: {
        id: 'modern_red',
        name: 'Modern Red',
        colors: {
            FACE_UP_BG: 0xfafafa,
            FACE_DOWN_BG: 0xd32f2f,
            FACE_DOWN_PATTERN: 0xffcdd2,
            FACE_UP_STROKE: 0xcccccc,
            FACE_DOWN_STROKE: 0xb71c1c,
            HOVER_STROKE: 0x4caf50,
            SELECTED_STROKE: 0xffeb3b,
            SUITS: {
                'Hearts': '#d32f2f',
                'Diamonds': '#f57c00',
                'Clubs': '#1976d2',
                'Spades': '#212121'
            },
            TEXT_DEFAULT: '#212121'
        },
        style: {
            STROKE_WIDTH_FACE_UP: 1,
            STROKE_WIDTH_FACE_DOWN: 1,
            STROKE_WIDTH_HOVER: 3,
            STROKE_WIDTH_SELECTED: 3,
            HOVER_OFFSET: 12
        },
        dimensions: {
            WIDTH: 100,
            HEIGHT: 140,
            CORNER_RADIUS: 0,
            GRID_SIZE: 20
        }
    },
    CUSTOM_ART: {
        id: 'custom_art',
        name: 'Custom Art',
        imageBack: 'card_back_custom',
        colors: {
            FACE_UP_BG: 0xffffff,
            FACE_DOWN_BG: 0x222E50,
            FACE_DOWN_PATTERN: 0xffffff,
            FACE_UP_STROKE: 0x888888,
            FACE_DOWN_STROKE: 0x000000,
            HOVER_STROKE: 0xffa500,
            SELECTED_STROKE: 0xffd700,
            SUITS: {
                'Hearts': '#ff0000',
                'Diamonds': '#ff8c00',
                'Clubs': '#00008b',
                'Spades': '#000000'
            },
            TEXT_DEFAULT: '#000000'
        },
        style: {
            STROKE_WIDTH_FACE_UP: 2,
            STROKE_WIDTH_FACE_DOWN: 0,
            STROKE_WIDTH_HOVER: 4,
            STROKE_WIDTH_SELECTED: 4,
            HOVER_OFFSET: 10
        },
        dimensions: {
            WIDTH: 100,
            HEIGHT: 140,
            CORNER_RADIUS: 0,
            GRID_SIZE: 15
        }
    }
};
