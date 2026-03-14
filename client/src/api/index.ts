import axios from 'axios'; // axios: 브라우저에서 서버로 http 요청(post, get, put, delete 등)을 보내는 라이브러리

const api = axios.create({
  baseURL: 'http://localhost:4000/api', // 모든 요청의 기본 url
  withCredentials: true,
});

api.interceptors.request.use((config) => { // 모든 http 요청이 서버로 보내지기 전에 가로채서 콜백 함수들 실행. 여기서 콜백 함수 기능은 토큰을 자동으로 헤더에 추가해줌.
  const token = localStorage.getItem('token'); // localStorage: 브라우저에 있는 영구저장소이므로 프론트엔드에서만 접근 가능.
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 인증
export const register = (data: { username: string; email: string; password: string }) =>
  api.post('/auth/register', data); // 회원가입 기능
export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data); // 로그인 기능

// 방
export const getRooms = () => api.get('/rooms'); // 방 목록 조회
export const createRoom = (data: { name: string }) => api.post('/rooms', data); // 방 생성
export const joinRoom = (roomId: number) => api.post(`/rooms/${roomId}/join`); // 방 입장

