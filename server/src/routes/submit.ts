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

    // 테스트케이스 조회
    const tcResult = await pool.query(
      'SELECT input, expected_output FROM test_cases WHERE problem_id = $1',
      [problem_id]
    );
    if (tcResult.rows.length === 0) {
      res.status(500).json({ message: '테스트케이스가 없습니다.' }); // 500: 서버 내부 오류
      return;
    }

    // 즉시 응답 후 채점 (비동기)
    res.json({ message: '제출 완료. 채점 중입니다.' });

    // 비동기 채점
    (async () => {
      try {
        const judgeResult = await judgeCode(code, tcResult.rows);
        console.log(`[judge] user:${req.userId} result:${judgeResult.status} (${judgeResult.passedCases}/${judgeResult.totalCases})`);

        await pool.query(
          `INSERT INTO submissions (user_id, room_id, problem_id, code, language, judge_status, passed_cases, total_cases)
           VALUES ($1, $2, $3, $4, 'python', $5, $6, $7)`,
          [req.userId, room_id, problem_id, code, judgeResult.status, judgeResult.passedCases, judgeResult.totalCases]
        );

        const io = getIo(); // socket.io 서버 객체 가져오기
        io.to(`room:${room_id}`).emit('room:opponent_submitted', {
          userId: req.userId,
          judgeStatus: judgeResult.status,
        }); // room:opponent_submitted: 이벤트 이름, io.to().emit(): socket.io에서 특정 room에만 보내는 이벤트

        const allSubs = await pool.query( 
          'SELECT user_id FROM submissions WHERE room_id = $1', 
          [room_id] 
        ); 

        const bothSubmitted =
          allSubs.rows.some((s: { user_id: number }) => s.user_id === room.player1_id) &&
          allSubs.rows.some((s: { user_id: number }) => s.user_id === room.player2_id);
        // some: 배열 안에 조건을 만족하는 요소가 하나라도 있으면 true
        if (bothSubmitted) { // 둘 다 제출했는지
          await handleTimeUp(io, room_id);
        }
      } catch (err) {
        console.error('[채점 오류]', err);
      }
    })();

  } catch (err) {
    console.error('[submit 오류]', err);
    if (!res.headersSent) {
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
});

export default router;
