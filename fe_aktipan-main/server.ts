import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  const PORT = 3000;

  // Real-time state store
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

  // Express API endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', roomsCount: rooms.size, time: new Date() });
  });

  // Upgrade handling
  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const pathname = url.pathname;
    
    if (pathname === '/ws/arena') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Broadcast to all players in a room
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

  // Pre-defined trivia questions for real-time play
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

          // Send current player their assigned ID
          ws.send(JSON.stringify({
            type: 'JOIN_SUCCESS',
            playerId,
            roomId: cleanRoomId,
            roomState: room
          }));

          // Notify room of updated players list
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

          // Start the game loop
          room.state = 'PLAYING';
          room.currentRound = 1;
          
          // Setup round 1 trivia
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

          // If playing and not buzzed yet
          if (room.state === 'PLAYING') {
            // For round 2, must verify bell signal is active
            if (room.currentRound === 2 && !room.bellSignalActive) {
              // Clicked too early (foul!)
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
              // Pure reflex round wins immediately!
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
              // Trivia rounds require answering
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
              // Round 2: Speed Bell Click (Pure reflex)
              room.state = 'PLAYING';
              room.questionText = "🚨 ADU CEPAT BEL REFLEKS! TUNGGU SINYAL BEL BERUBAH MERAH! 🚨";
              room.options = [];
              room.correctAnswer = '';
              room.bellSignalActive = false;
              
              broadcastToRoom(roomId, {
                type: 'ROOM_UPDATE',
                roomState: room
              });

              // Trigger bell signal after random delay
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
              // Round 3: Trivia again
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
            // End of Game
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

  // Serve static assets / Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Express and WebSocket server running on http://localhost:${PORT}`);
  });
}

startServer();
