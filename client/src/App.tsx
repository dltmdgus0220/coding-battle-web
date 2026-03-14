import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LobbyPage from './pages/LobbyPage';
import RoomPage from './pages/RoomPage';
import ResultPage from './pages/ResultPage';
import CodeReviewPage from './pages/CodeReviewPage';
import './App.css';

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />; // 토큰이 없으면 로그인 페이지로 보냄.
  return children; // 토큰이 있다면 원래 페이지 계속 보여줌.
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/lobby" element={<RequireAuth><LobbyPage /></RequireAuth>} />
        <Route path="/room/:roomId" element={<RequireAuth><RoomPage /></RequireAuth>} />
        <Route path="/result/:matchId" element={<RequireAuth><ResultPage /></RequireAuth>} />
        <Route path="/review/:matchId" element={<RequireAuth><CodeReviewPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  ); // URL과 컴포넌트 연결. path="*": 모든 잘못된 url을 login 페이지로 강제 이동.
} // 로그인이 필요한 페이지만 RequireAuth로 감싸서 보호.
