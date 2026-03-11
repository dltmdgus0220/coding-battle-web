import { Router, Response } from 'express';
import pool from '../db/connection';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 매치 결과 조회
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => { // /matches/1 이런 형태의 url 처리
  const matchId = parseInt(String(req.params.id)); // url에 붙은 id를 반환. 예를 들어 matches/1이면 1을 반환.
  try {
    const result = await pool.query(`
      SELECT m.*, r.player1_id, r.player2_id,
             u1.username AS player1_name, u2.username AS player2_name,
             uw.username AS winner_name
      FROM matches m
      JOIN rooms r ON m.room_id = r.id
      LEFT JOIN users u1 ON r.player1_id = u1.id
      LEFT JOIN users u2 ON r.player2_id = u2.id
      LEFT JOIN users uw ON m.winner_id = uw.id
      WHERE m.id = $1
    `, [matchId]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: '매치를 찾을 수 없습니다.' });
      return;
    }
    const match = result.rows[0];
    // 해당 매치 참가자만 조회 가능
    if (match.player1_id !== req.userId && match.player2_id !== req.userId) {
      res.status(403).json({ message: '접근 권한이 없습니다.' });
      return;
    }
    res.json(match);
  } catch (err) {
    console.error('매치 조회 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 특정 유저의 제출 코드 열람
router.get('/:id/code/:userId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const matchId = parseInt(String(req.params.id));
  const targetUserId = parseInt(String(req.params.userId));
  try {
    // 매치 참가자 확인
    const matchResult = await pool.query(`
      SELECT r.player1_id, r.player2_id, m.room_id
      FROM matches m
      JOIN rooms r ON m.room_id = r.id
      WHERE m.id = $1
    `, [matchId]);
    if (matchResult.rows.length === 0) {
      res.status(404).json({ message: '매치를 찾을 수 없습니다.' });
      return;
    }
    const { player1_id, player2_id, room_id } = matchResult.rows[0];
    if (player1_id !== req.userId && player2_id !== req.userId) {
      res.status(403).json({ message: '접근 권한이 없습니다.' });
      return;
    }
    // 제출 코드 조회
    const subResult = await pool.query(
      'SELECT code, judge_status, passed_cases, total_cases, submitted_at FROM submissions WHERE room_id = $1 AND user_id = $2',
      [room_id, targetUserId]
    );
    if (subResult.rows.length === 0) {
      res.json({ code: null, message: '제출 내역이 없습니다.' });
      return;
    }
    res.json(subResult.rows[0]);
  } catch (err) {
    console.error('코드 열람 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
