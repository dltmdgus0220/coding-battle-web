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

      // 상대방에게 입장 알림
      socket.to(`room:${roomId}`).emit('room:player_joined', { username }); // 특정 room에 속한 소켓들에게 이벤트를 전송하는데 자기 자신은 제외. socket.to().emit(): 내부적으로 broadcast 동작. 그러나 broadcast는 룸을 지정못하기 때문에 저렇게 씀.

      // 두 명이 모두 있으면 게임 시작
      if (room.player1_id && room.player2_id) {
        if (room.status === 'in_progress') {
          // 이미 게임 중 → 재접속한 플레이어에게만 현재 상태 전달
          socket.emit('room:game_start', {
            problemId: room.problem_id,
            serverTime: room.game_started_at,
            player1: { id: room.player1_id, username: room.player1_name },
            player2: { id: room.player2_id, username: room.player2_name },
          });
        } else {
          // 처음 시작
          const startedAt = new Date().toISOString();
          await pool.query(
            'UPDATE rooms SET status = $1, game_started_at = $2 WHERE id = $3',
            ['in_progress', startedAt, roomId]
          );
          io.to(`room:${roomId}`).emit('room:game_start', {
            problemId: room.problem_id,
            serverTime: startedAt,
            player1: { id: room.player1_id, username: room.player1_name },
            player2: { id: room.player2_id, username: room.player2_name },
          });
        }
      }
    });

    // 타이머 종료 처리 (클라이언트가 알림)
    socket.on('room:time_up', async ({ roomId }: { roomId: number }) => {
      await handleTimeUp(io, roomId);
    });

    socket.on('disconnect', () => {
      console.log(`소켓 연결 해제: ${socket.id}`);
    });
  });
}

export async function handleTimeUp(io: Server, roomId: number) {
  const room = await pool.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
  if (!room.rows[0] || room.rows[0].status !== 'in_progress') return; // 정보가 없거나 진행중이 아니면 return

  // 각 플레이어 제출 여부 확인
  const subs = await pool.query(
    'SELECT user_id, judge_status, submitted_at FROM submissions WHERE room_id = $1',
    [roomId]
  );

  const p1Id = room.rows[0].player1_id;
  const p2Id = room.rows[0].player2_id;
  const p1Sub = subs.rows.find((s: { user_id: number }) => s.user_id === p1Id);
  const p2Sub = subs.rows.find((s: { user_id: number }) => s.user_id === p2Id);

  const p1Accepted = p1Sub?.judge_status === 'Accepted'; // ?.: 옵셔널 체이닝, p1Sub.judge_state === 'Accept'이면 p1Sub.judge_state 반환하고 아니면 undefined 반환
  const p2Accepted = p2Sub?.judge_status === 'Accepted';

  let winnerId: number | null = null;
  if (p1Accepted && p2Accepted) {
    winnerId = new Date(p1Sub.submitted_at) < new Date(p2Sub.submitted_at) ? p1Id : p2Id;
  } else if (p1Accepted) {
    winnerId = p1Id;
  } else if (p2Accepted) {
    winnerId = p2Id;
  }

  // 결과 저장
  const matchResult = await pool.query(
    `INSERT INTO matches (room_id, winner_id, p1_submitted_at, p2_submitted_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (room_id) DO UPDATE SET winner_id = $2
     RETURNING id`,
    [roomId, winnerId, p1Sub?.submitted_at || null, p2Sub?.submitted_at || null]
  ); // 이미 room_id가 있다면 winner_id만 업데이트
  await pool.query('UPDATE rooms SET status = $1 WHERE id = $2', ['finished', roomId]);

  io.to(`room:${roomId}`).emit('room:result', {
    matchId: matchResult.rows[0].id,
    winnerId,
    p1: { userId: p1Id, status: p1Sub?.judge_status || 'not_submitted', submittedAt: p1Sub?.submitted_at },
    p2: { userId: p2Id, status: p2Sub?.judge_status || 'not_submitted', submittedAt: p2Sub?.submitted_at },
  });
}
