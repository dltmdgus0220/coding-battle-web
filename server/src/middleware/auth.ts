import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request { // Express의 Request 구조는 body, params, query, headers인데 여기에 userId, username을 추가해줌. interface는 새로운 객체를 정의하는 문법
  userId?: number;
  username?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(' ')[1]; // authorization을 받는데 ?의 의미는 없으면 undefined 반환
  if (!token) {
    res.status(401).json({ message: '인증 토큰이 없습니다.' });
    return;
  }
  try { // try-catch는 python에서의 try-except와 같은 의미
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { // jwt.verify: 토큰이 잘못되면 에러를 발생시키는 역할
      userId: number;
      username: string;
    }; // jwt.verify는 any 타입을 반환하는데 이러면 ts에서는 오류남 그래서 타입지정해주는 거임
    req.userId = decoded.userId;
    req.username = decoded.username;
    next(); // 다음 미들웨어 혹은 라우더 실행. 이게 없으면 여기서 프로그램이 멈춤. 흐름: request(로그인)->middleware(인증)->next()->controller 실행
  } catch {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
}
