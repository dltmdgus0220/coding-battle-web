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
