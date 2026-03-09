import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/connection';

const router = Router();

// 회원가입
router.post('/register', async (req: Request, res: Response): Promise<void> => { // Promise: 비동기 작업의 결과를 약속하는 객체.
  const { username, email, password } = req.body;
  if (!username || !email || !password) { // 필드값이 비어있을때
    res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    return;
  }
  try {
    const existing = await pool.query( // pool 객체로 db 연결
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    if (existing.rows.length > 0) {
      res.status(409).json({ message: '이미 사용 중인 이메일 또는 닉네임입니다.' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10); // 비밀번호 해시로 변환
    const result = await pool.query( 
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, passwordHash]
    ); // 테이블에 정보 입력. RETURNING: 저장 후 다시 id, username, email 값 반환. 즉 다시 select를 할 필요가 없음. postgres 기능.
    const user = result.rows[0]; // {rows:[{id:1, username:test, email:test@email.com}], rowCount:1 } 형태
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET as string, // jwt 서명 키. 토큰이 위조되었는지를 판단.
      { expiresIn: '7d' } // 토큰 만료 시간. 7일 후 토큰 만료.
    ); // jwt 토큰 생성
    res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email } }); // 서버에서 클라이언트로 응답을 보내는 객체
  } catch (err) {
    console.error('회원가입 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
    return;
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      return;
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash); // 해시와 비교
    if (!valid) {
      res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      return;
    }
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error('로그인 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
