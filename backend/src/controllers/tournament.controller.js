import Tournament from "../models/tournament.model.js";

// Create a new tournament
export const createTournament = async (req, res) => {
    try {
        const { name, gameType } = req.body;

        const tournament = await Tournament.create({
            name,
            gameType,
            admin: req.user._id,
            participants: [req.user._id] // Admin auto-joins? Or maybe just hosts. Let's say hosts, but option to join. 
            // User request: "admin can create a tournament people can join"
            // Let's keep participants empty initially unless admin creates & joins.
            // Actually, let's allow admin to be just admin.
        });

        // Reset participants to empty if we don't want admin to play by default
        tournament.participants = [];
        await tournament.save();

        res.status(201).json(tournament);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all tournaments
export const getTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find()
            .populate('admin', 'username')
            .populate('winner', 'username')
            .sort({ createdAt: -1 });
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single tournament details
export const getTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate('participants', 'username avatar')
            .populate('rounds.matches.player1', 'username')
            .populate('rounds.matches.player2', 'username')
            .populate('rounds.matches.winner', 'username')
            .populate('winner', 'username');

        if (!tournament) return res.status(404).json({ message: "Tournament not found" });

        res.json(tournament);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Join a tournament
export const joinTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: "Tournament not found" });

        if (tournament.status !== 'open') {
            return res.status(400).json({ message: "Tournament is no longer open for joining" });
        }

        if (tournament.participants.includes(req.user._id)) {
            return res.status(400).json({ message: "You have already joined this tournament" });
        }

        tournament.participants.push(req.user._id);
        await tournament.save();

        res.json(tournament);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Start tournament (Generate Round 1)
export const startTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: "Tournament not found" });

        // Only admin can start?
        // if (tournament.admin.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        //   return res.status(403).json({ message: "Not authorized to start tournament" });
        // }

        if (tournament.participants.length < 2) {
            return res.status(400).json({ message: "Need at least 2 players to start" });
        }

        tournament.status = 'in_progress';
        tournament.currentRound = 1;

        // Shuffle participants
        const shuffled = [...tournament.participants].sort(() => 0.5 - Math.random());
        const matches = [];

        // Simple pairing
        for (let i = 0; i < shuffled.length; i += 2) {
            if (i + 1 < shuffled.length) {
                matches.push({
                    player1: shuffled[i],
                    player2: shuffled[i + 1],
                    status: 'pending'
                });
            } else {
                // Odd one out - Auto win (bye) or wait? 
                // For MVP, give them a 'bye' -> instantly moved to next round?
                // Let's simpler: Just add them as a match with no player2, and we handle 'bye' logic later
                // or effectively they win immediately.
                matches.push({
                    player1: shuffled[i],
                    player2: null,
                    winner: shuffled[i], // Auto win
                    status: 'completed'
                });
            }
        }

        tournament.rounds.push({
            roundNumber: 1,
            matches: matches
        });

        await tournament.save();
        res.json(tournament);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Report match result (Admin or System)
// Ideally this is called by the game server when a game ends
export const advanceTournament = async (req, res) => {
    // This is a simplified "Advance" or "Update" logic
    // Currently we'll just expose a way to set a winner for a match
    // and if all matches in round are done, generate next round.

    // For MVP, Admin manually clicks "Declare Winner" on a match? 
    // Or we have an endpoint `PUT /tournaments/:id/matches/:matchId`
    // Let's implement that logic here for flexibility.

    // NOT FULLY IMPLEMENTED yet in this snippet, keeping it simple.
    res.json({ message: "Advance logic to be implemented" });
};
