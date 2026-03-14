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

