import { Router, Response } from 'express';
import pool from '../db/connection';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { judgeCode } from '../services/judge';
import { getIo } from '../socket/ioInstance';
import { handleTimeUp } from '../socket/roomSocket';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { room_id, problem_id, code } = req.body;

  try {
    if (!room_id || !problem_id || !code) {
      res.status(400).json({ message: '필수 항목이 누락되었습니다.' }); // 400: 잘못된 요청
      return;
    }

    // 이미 제출했는지 확인
    const existing = await pool.query(
      'SELECT id FROM submissions WHERE room_id = $1 AND user_id = $2',
      [room_id, req.userId]
    );
    if (existing.rows.length > 0) {
      res.status(409).json({ message: '이미 제출하셨습니다.' }); // 409: 요청은 정상이지만 현재 데이터 상태와 충돌이 발생함.
      return;
    }

    // 방 상태 확인
    const roomResult = await pool.query('SELECT * FROM rooms WHERE id = $1', [room_id]);
    if (!roomResult.rows[0]) {
      res.status(404).json({ message: '방을 찾을 수 없습니다.' }); // 404: 리소스 없음
      return;
    }

    const room = roomResult.rows[0];
    console.log(`[submit] room status: ${room.status}, room_id: ${room_id}, user_id: ${req.userId}`);

    if (room.status !== 'in_progress') {
      res.status(409).json({ message: `게임 중인 방이 아닙니다. (현재 상태: ${room.status})` });
      return;
    }
