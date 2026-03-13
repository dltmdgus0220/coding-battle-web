import { Server, Socket } from 'socket.io';
import pool from '../db/connection';

export function initRoomSocket(io: Server) {
  io.on('connection', (socket: Socket) => { // io.on: connection 이벤트 발생하면 아래 콜백 함수들 실행. socket은 인자로 받음.
    console.log(`소켓 연결: ${socket.id}`);

    // 방 소켓 룸 참가
    socket.on('room:join', async ({ roomId, userId, username }: { roomId: number; userId: number; username: string }) => { // socket.on: 특정 클라이언트에서 room:join 이벤트 발생하면 콜백함수실행
      // 클라이언트에서 서버로 객체형태로 보내기 때문에 { roomId, userId, username }: { roomId: number; userId: number; username: string } 이런 형태로 받음.
      socket.join(`room:${roomId}`); // 현재 소켓을 특정 room에 등록. 여기서 room은 socket.io 에서 제공하는 기능으로, 소켓을 그룹으로 묶어주는 역할.
      socket.data.userId = userId; // socket.data: socket.io에서 제공하는 프로퍼티(데이터 저장 공간)
      socket.data.username = username;
      socket.data.roomId = roomId;

      // 방 정보 조회
      const roomResult = await pool.query(`
        SELECT r.*, u1.username AS player1_name, u2.username AS player2_name
        FROM rooms r
        LEFT JOIN users u1 ON r.player1_id = u1.id
        LEFT JOIN users u2 ON r.player2_id = u2.id
        WHERE r.id = $1
      `, [roomId]);

      if (roomResult.rows.length === 0) return; // ===: 엄격 비교 연산자. ex) 0 == "0": true, 0 === "0": false
      const room = roomResult.rows[0];

}
