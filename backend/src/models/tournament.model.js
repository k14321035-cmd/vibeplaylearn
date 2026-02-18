import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
    player1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    player2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    gameId: { type: String } // Reference to the actual game room/session if needed
});

const roundSchema = new mongoose.Schema({
    roundNumber: { type: Number, required: true },
    matches: [matchSchema]
});

const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gameType: {
        type: String,
        enum: ['tictactoe', 'chess', 'checkers'],
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'completed'],
        default: 'open'
    },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rounds: [roundSchema],
    currentRound: { type: Number, default: 0 },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

export default Tournament;
