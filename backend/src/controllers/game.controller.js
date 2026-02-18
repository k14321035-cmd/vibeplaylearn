import Game from "../models/game.model.js";

// Seed data
const INITIAL_GAMES = [
    {
        title: 'Tic Tac Toe',
        identifier: 'tictactoe',
        description: 'Classic 3x3 strategy game',
        icon: 'grid',
        colors: ['#FF9A9E', '#FECFEF'],
        category: 'Strategy',
        isFeatured: true
    },
    {
        title: 'Chess',
        identifier: 'chess',
        description: 'Strategic board game for two players',
        icon: 'game-controller',
        colors: ['#a18cd1', '#fbc2eb'],
        category: 'Board',
        isFeatured: true
    },
    {
        title: 'Checkers',
        identifier: 'checkers',
        description: 'Capture opponent pieces',
        icon: 'ellipse',
        colors: ['#84fab0', '#8fd3f4'],
        category: 'Board',
        isFeatured: false
    },
    {
        title: 'Poker',
        identifier: 'poker',
        description: 'High stakes card game',
        icon: 'card',
        colors: ['#ff9a9e', '#fecfef'],
        category: 'Card',
        isComingSoon: true,
        isFeatured: false
    }
];

export const getGames = async (req, res) => {
    try {
        let games = await Game.find().sort({ isFeatured: -1, createdAt: -1 });

        if (games.length === 0) {
            console.log('Seeding initial games...');
            games = await Game.insertMany(INITIAL_GAMES);
        }

        res.json(games);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getGameByIdentifier = async (req, res) => {
    try {
        const { identifier } = req.params;
        const game = await Game.findOne({ identifier });

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
