import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors'; // 다른 도메인 접근 허용
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import roomsRouter from './routes/rooms';
import problemsRouter from './routes/problems';
import submitRouter from './routes/submit';
import matchesRouter from './routes/matches';
import { initRoomSocket } from './socket/roomSocket';
import { setIo } from './socket/ioInstance';

dotenv.config(); // 환경변수로드

const app = express(); // express 앱 생성
const server = http.createServer(app); // http 서버 생성
const io = new Server(server, { // http 서버 위에 socket.io 서버 생성
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }, // cors 설정을 통해 프론트엔드 도메인에서의 WebSocket 연결을 허용
});
setIo(io); // 생성한 socket.io 인스턴스를 전역적으로 사용할 수 있게 설정

// use: 미들웨어나 라우터를 등록하는 함수
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json()); // 요청 body의 json을 읽을 수 있게 해주는 미들웨어

app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/problems', problemsRouter);
app.use('/api/submit', submitRouter);
app.use('/api/matches', matchesRouter);

initRoomSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});

