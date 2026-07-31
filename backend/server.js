import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
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
import roundNameTournementRouter from './routes/roundNameTournement.route.js';
import knockoutStageRouter from './routes/knockoutStage.route.js';

dotenv.config();

import { upload } from './middlewares/upload.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect MongoDB
connectDB();

app.post('/api/teams/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có ảnh được tải lên' });
  }

  // If Cloudinary uploaded successfully, path is the remote HTTP/HTTPS URL
  let imageUrl = req.file.path || req.file.secure_url;
  
  if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
    // Fallback if local storage was used
    imageUrl = `${req.protocol}://${req.get('host')}/uploads/teams/${req.file.filename}`;
  }

  res.status(200).json({ imageUrl });
});

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
app.use('/api/knockout-stages', knockoutStageRouter);
app.use('/api/round-names-tournament', roundNameTournementRouter);

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
