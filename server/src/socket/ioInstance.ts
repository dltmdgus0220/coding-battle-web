import { Server } from 'socket.io';

let _io: Server | null = null; // Server를 저장할 전역 변수 선언

export function setIo(io: Server) {
  _io = io;
}

export function getIo(): Server {
  if (!_io) throw new Error('Socket.io가 초기화되지 않았습니다.');
  return _io;
}
