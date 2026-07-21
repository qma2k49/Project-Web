import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './configs/db.js';

// Routers
import authRouter from './routes/auth.route.js';
import stadiumRouter from './routes/stadium.route.js';
import teamRouter from './routes/team.route.js';
import personRouter from './routes/person.route.js';
import tournamentRouter from './routes/tournament.route.js';
import matchRouter from './routes/match.route.js';
import predictionRouter from './routes/prediction.route.js';
import teamStandingRouter from './routes/teamStanding.route.js';
import playerStandingRouter from './routes/playerStanding.route.js';
import matchEventRouter from './routes/matchEvent.route.js';
import matchLineupRouter from './routes/matchLineup.route.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable Socket.io Server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// API Routes for ALL 12 Models
app.use('/api/auth', authRouter);
app.use('/api/stadiums', stadiumRouter);
app.use('/api/teams', teamRouter);
app.use('/api/persons', personRouter);
app.use('/api/tournaments', tournamentRouter);
app.use('/api/matches', matchRouter);
app.use('/api/predictions', predictionRouter);
app.use('/api/team-standings', teamStandingRouter);
app.use('/api/player-standings', playerStandingRouter);
app.use('/api/match-events', matchEventRouter);
app.use('/api/match-lineups', matchLineupRouter);

// Socket.io Real-time Event Handlers
io.on('connection', (socket) => {
  console.log(`⚡ Socket client connected: ${socket.id}`);

  socket.on('join:match', ({ matchId }) => {
    socket.join(`match-${matchId}`);
    console.log(`User joined room match-${matchId}`);
  });

  socket.on('leave:match', ({ matchId }) => {
    socket.leave(`match-${matchId}`);
  });

  // Relay Live Control Events broadcast
  socket.on('match:event', (eventData) => {
    io.emit('match:event', eventData);
    if (eventData.matchId) {
      io.to(`match-${eventData.matchId}`).emit('match:event', eventData);
    }
  });

  socket.on('match:scoreUpdate', (scoreData) => {
    io.emit('match:scoreUpdate', scoreData);
    if (scoreData.matchId) {
      io.to(`match-${scoreData.matchId}`).emit('match:scoreUpdate', scoreData);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 QLBongDa Backend Server running on port ${PORT}`);
});
