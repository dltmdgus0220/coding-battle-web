import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client'; // socket.io-client: 웹소켓 통신을 쉽게 만들어주는 라이브러리. io: 서버와 연결을 만드는 함수. Socket: socket 객체의 타입을 얘기함.

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io('http://localhost:4000', { withCredentials: true }); // withCredentials true: 쿠키 포함해서 요청. 로그인 세션 유지할 때 필요.
  }
  return socketInstance;
} // socket이 있으면 안만들고 없으면 만듦. 앱 전체에서 하나의 socket 연결을 재사용하도록 관리 (Singleton 패턴)

