import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client'; // socket.io-client: 웹소켓 통신을 쉽게 만들어주는 라이브러리. io: 서버와 연결을 만드는 함수. Socket: socket 객체의 타입을 얘기함.
