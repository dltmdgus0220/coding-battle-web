import { Router, Response } from 'express';
import pool from '../db/connection';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 문제 조회 (샘플 테스트케이스만 포함)
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const problemId = parseInt(String(req.params.id));
  try {
    const problemResult = await pool.query('SELECT * FROM problems WHERE id = $1', [problemId]);
    if (problemResult.rows.length === 0) {
      res.status(404).json({ message: '문제를 찾을 수 없습니다.' });
      return;
    }
    const sampleCases = await pool.query(
      'SELECT input, expected_output FROM test_cases WHERE problem_id = $1 AND is_sample = TRUE',
      [problemId]
    );
    res.json({ ...problemResult.rows[0], sample_cases: sampleCases.rows });
  } catch (err) {
    console.error('문제 조회 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
