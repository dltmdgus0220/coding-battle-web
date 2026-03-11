import { Router, Response } from 'express';
import pool from '../db/connection';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 방 목록 조회 (waiting 상태)
router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.name, r.status, r.created_at,
             u1.username AS player1_name,
             u2.username AS player2_name
      FROM rooms r
      LEFT JOIN users u1 ON r.player1_id = u1.id
      LEFT JOIN users u2 ON r.player2_id = u2.id
      WHERE r.status = 'waiting'
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('방 목록 조회 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 방 생성
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ message: '방 이름을 입력해주세요.' });
    return;
  }
  try {
    // 랜덤 문제 선택
    const problemResult = await pool.query('SELECT id FROM problems ORDER BY RANDOM() LIMIT 1');
    if (problemResult.rows.length === 0) {
      res.status(500).json({ message: '문제가 없습니다.' });
      return;
    }
    const problemId = problemResult.rows[0].id;
    const result = await pool.query(
      'INSERT INTO rooms (name, problem_id, player1_id) VALUES ($1, $2, $3) RETURNING *',
      [name, problemId, req.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('방 생성 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

