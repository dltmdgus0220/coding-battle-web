import { Router, Response } from 'express';
import pool from '../db/connection';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { judgeCode } from '../services/judge';
import { getIo } from '../socket/ioInstance';
import { handleTimeUp } from '../socket/roomSocket';

const router = Router();
