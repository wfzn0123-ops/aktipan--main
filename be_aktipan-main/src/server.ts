import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { seedDatabase } from './database/seed.js';
import { db } from './database/db.js';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import packRoutes from './routes/packRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (CORS_ORIGIN.includes('*') || CORS_ORIGIN.includes(origin) || CORS_ORIGIN.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev/local
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toLocaleTimeString('id-ID')}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'be_aktipan-main',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      usersCount: db.getUsers().length,
      activitiesCount: db.getActivities().length,
      sessionsCount: db.getSessions().length,
      packsCount: db.getPacks().length
    }
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/packs', packRoutes);
app.use('/api/sessions', sessionRoutes);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan di server be_aktipan-main.`
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Real-time Live Arena WebSocket Implementation
interface Player {
  id: string;
  name: string;
  title: string;
  team: 'red' | 'blue' | 'none';
  isReady: boolean;
  score: number;
}

interface Room {
  id: string;
  state: 'LOBBY' | 'PLAYING' | 'QUESTION' | 'BUZZED' | 'ROUND_OVER' | 'SUMMARY';
  players: Player[];
  currentRound: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  buzzedPlayerId: string | null;
  buzzTime: number | null;
  roundWinner: string | null;
  bellSignalActive: boolean;
}

const rooms = new Map<string, Room>();
const clientRooms = new Map<WebSocket, { roomId: string; playerId: string }>();

const GAME_QUESTIONS = [
  {
    text: "Apa kepanjangan dari istilah 'MC' dalam dunia panggung?",
    options: ["Master of Ceremony", "Master of Communication", "Music Conductor", "Microphone Controller"],
    answer: "Master of Ceremony"
  },
  {
    text: "Manakah teknik ice breaking yang paling efektif untuk mencairkan ketegangan audiens dalam 2 menit?",
    options: ["Membacakan slide materi", "Permainan tepuk ritmis interaktif", "Kuis hitungan kalkulus", "Membagikan lembar kuisioner"],
    answer: "Permainan tepuk ritmis interaktif"
  },
  {
    text: "Apa tindakan pertama MC jika mikrofon tiba-tiba mati di tengah kalimat?",
    options: ["Panik dan lari ke belakang panggung", "Tetap tenang, berbicara lantang, dan gunakan gestur tubuh", "Menunjuk-nunjuk operator sound system", "Menghentikan seluruh acara seketika"],
    answer: "Tetap tenang, berbicara lantang, dan gunakan gestur tubuh"
  },
  {
    text: "Istilah 'The Heckler' dalam public speaking merujuk pada...",
    options: ["Peserta yang asyik tidur", "Peserta yang menyela atau membantah secara agresif", "Panitia yang membawakan mikrofon", "Sponsor utama kegiatan"],
    answer: "Peserta yang menyela atau membantah secara agresif"
  },
  {
    text: "Sikap panggung manakah yang melambangkan wibawa kepemimpinan (Aura Panggung)?",
    options: ["Berdiri tegak, tangan terbuka hangat, kontak mata merata", "Menunduk membaca teks terus-menerus", "Memasukkan kedua tangan ke saku celana", "Menyilangkan tangan di dada dengan angkuh"],
    answer: "Berdiri tegak, tangan terbuka hangat, kontak mata merata"
  }
];

function broadcastToRoom(roomId: string, message: any) {
  const room = rooms.get(roomId);
  if (!room) return;
  const payload = JSON.stringify(message);

  for (const [ws, info] of clientRooms.entries()) {
    if (info.roomId === roomId && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || '', `http://${request.headers.host}`);
  const pathname = url.pathname;

  if (pathname === '/ws/arena' || pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      const { type } = data;

      if (type === 'JOIN_ROOM') {
        const { roomId, playerName, playerTitle, playerTeam } = data;
        const cleanRoomId = (roomId || 'GLOBAL').trim().toUpperCase();

        let room = rooms.get(cleanRoomId);
        if (!room) {
          room = {
            id: cleanRoomId,
            state: 'LOBBY',
            players: [],
            currentRound: 0,
            questionText: '',
            options: [],
            correctAnswer: '',
            buzzedPlayerId: null,
            buzzTime: null,
            roundWinner: null,
            bellSignalActive: false
          };
          rooms.set(cleanRoomId, room);
        }

        const playerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newPlayer: Player = {
          id: playerId,
          name: playerName || 'Anonim',
          title: playerTitle || 'Trainer',
          team: playerTeam || 'none',
          isReady: false,
          score: 0
        };

        room.players.push(newPlayer);
        clientRooms.set(ws, { roomId: cleanRoomId, playerId });

        ws.send(JSON.stringify({
          type: 'JOIN_SUCCESS',
          playerId,
          roomId: cleanRoomId,
          roomState: room
        }));

        broadcastToRoom(cleanRoomId, {
          type: 'ROOM_UPDATE',
          roomState: room
        });
      }

      else if (type === 'TOGGLE_READY') {
        const info = clientRooms.get(ws);
        if (!info) return;
        const { roomId, playerId } = info;
        const room = rooms.get(roomId);
        if (!room) return;

        const player = room.players.find(p => p.id === playerId);
        if (player) {
          player.isReady = !player.isReady;
        }

        broadcastToRoom(roomId, {
          type: 'ROOM_UPDATE',
          roomState: room
        });
      }

      else if (type === 'START_GAME') {
        const info = clientRooms.get(ws);
        if (!info) return;
        const { roomId } = info;
        const room = rooms.get(roomId);
        if (!room || room.players.length === 0) return;

        room.state = 'PLAYING';
        room.currentRound = 1;

        const q = GAME_QUESTIONS[Math.floor(Math.random() * GAME_QUESTIONS.length)];
        room.questionText = q.text;
        room.options = q.options;
        room.correctAnswer = q.answer;
        room.buzzedPlayerId = null;
        room.buzzTime = null;
        room.roundWinner = null;
        room.bellSignalActive = false;

        broadcastToRoom(roomId, {
          type: 'GAME_STARTED',
          roomState: room
        });
      }

      else if (type === 'BUZZ') {
        const info = clientRooms.get(ws);
        if (!info) return;
        const { roomId, playerId } = info;
        const room = rooms.get(roomId);
        if (!room) return;

        const player = room.players.find(p => p.id === playerId);
        if (!player) return;

        if (room.state === 'PLAYING') {
          if (room.currentRound === 2 && !room.bellSignalActive) {
            player.score = Math.max(0, player.score - 30);
            ws.send(JSON.stringify({
              type: 'FOUL',
              message: 'FOUL! Bel ditekan sebelum sinyal aktif!'
            }));
            broadcastToRoom(roomId, {
              type: 'ROOM_UPDATE',
              roomState: room
            });
            return;
          }

          room.buzzedPlayerId = playerId;
          room.buzzTime = Date.now();

          if (room.currentRound === 2) {
            player.score += 150;
            room.roundWinner = playerId;
            room.state = 'ROUND_OVER';
            broadcastToRoom(roomId, {
              type: 'ROUND_RESULT',
              isCorrect: true,
              pointsGained: 150,
              correctAnswer: 'Refleks Bel Cepat',
              answeringPlayerName: player.name,
              roomState: room
            });
          } else {
            broadcastToRoom(roomId, {
              type: 'BUZZED',
              buzzedPlayerId: playerId,
              buzzedPlayerName: player.name,
              roomState: room
            });
          }
        }
      }

      else if (type === 'SUBMIT_ANSWER') {
        const info = clientRooms.get(ws);
        if (!info) return;
        const { roomId, playerId } = info;
        const room = rooms.get(roomId);
        if (!room) return;

        const { answer } = data;
        const player = room.players.find(p => p.id === playerId);
        if (!player || room.buzzedPlayerId !== playerId) return;

        const isCorrect = answer === room.correctAnswer;
        const points = isCorrect ? 100 : -50;
        player.score += points;

        room.roundWinner = playerId;
        room.state = 'ROUND_OVER';

        broadcastToRoom(roomId, {
          type: 'ROUND_RESULT',
          isCorrect,
          pointsGained: points,
          correctAnswer: room.correctAnswer,
          answeringPlayerName: player.name,
          roomState: room
        });
      }

      else if (type === 'NEXT_ROUND') {
        const info = clientRooms.get(ws);
        if (!info) return;
        const { roomId } = info;
        const room = rooms.get(roomId);
        if (!room) return;

        room.buzzedPlayerId = null;
        room.buzzTime = null;
        room.roundWinner = null;

        if (room.currentRound < 3) {
          room.currentRound += 1;

          if (room.currentRound === 2) {
            room.state = 'PLAYING';
            room.questionText = "🚨 ADU CEPAT BEL REFLEKS! TUNGGU SINYAL BEL BERUBAH MERAH! 🚨";
            room.options = [];
            room.correctAnswer = '';
            room.bellSignalActive = false;

            broadcastToRoom(roomId, {
              type: 'ROOM_UPDATE',
              roomState: room
            });

            const delay = 3000 + Math.random() * 4000;
            setTimeout(() => {
              const refreshedRoom = rooms.get(roomId);
              if (refreshedRoom && refreshedRoom.currentRound === 2 && refreshedRoom.state === 'PLAYING') {
                refreshedRoom.bellSignalActive = true;
                broadcastToRoom(roomId, {
                  type: 'BELL_SIGNAL_ACTIVE',
                  roomState: refreshedRoom
                });
              }
            }, delay);

          } else {
            room.state = 'PLAYING';
            const q = GAME_QUESTIONS[Math.floor(Math.random() * GAME_QUESTIONS.length)];
            room.questionText = q.text;
            room.options = q.options;
            room.correctAnswer = q.answer;
            room.bellSignalActive = false;

            broadcastToRoom(roomId, {
              type: 'ROOM_UPDATE',
              roomState: room
            });
          }
        } else {
          room.state = 'SUMMARY';
          broadcastToRoom(roomId, {
            type: 'GAME_OVER',
            roomState: room
          });
        }
      }

      else if (type === 'RESET_LOBBY') {
        const info = clientRooms.get(ws);
        if (!info) return;
        const { roomId } = info;
        const room = rooms.get(roomId);
        if (!room) return;

        room.state = 'LOBBY';
        room.currentRound = 0;
        room.buzzedPlayerId = null;
        room.bellSignalActive = false;
        room.players.forEach(p => {
          p.score = 0;
          p.isReady = false;
        });

        broadcastToRoom(roomId, {
          type: 'ROOM_UPDATE',
          roomState: room
        });
      }

      else if (type === 'SEND_ARENA_CHAT') {
        const info = clientRooms.get(ws);
        if (!info) return;
        const { roomId } = info;
        const { sender, text, role } = data;

        broadcastToRoom(roomId, {
          type: 'ARENA_CHAT_MSG',
          sender,
          text,
          role,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        });
      }

    } catch (err) {
      console.error('WS Error:', err);
    }
  });

  ws.on('close', () => {
    const info = clientRooms.get(ws);
    if (!info) return;
    const { roomId, playerId } = info;
    clientRooms.delete(ws);

    const room = rooms.get(roomId);
    if (room) {
      room.players = room.players.filter(p => p.id !== playerId);
      if (room.players.length === 0) {
        rooms.delete(roomId);
      } else {
        broadcastToRoom(roomId, {
          type: 'ROOM_UPDATE',
          roomState: room
        });
      }
    }
  });
});

// Start Server & Seed Database
async function start() {
  try {
    await seedDatabase();
    server.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`🚀 BE_AKTIPAN-MAIN BACKEND RUNNING ON http://localhost:${PORT}`);
      console.log(`⚡ WebSocket Live Arena available on ws://localhost:${PORT}/ws/arena`);
      console.log(`🔐 Admin: admin@aktipan.com | Password: admin123`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

export { app, server };
