import { useLocation, useNavigate, useParams } from 'react-router-dom';

interface PlayerResult {
  userId: number;
  status: string;
  submittedAt: string | null;
}

interface GameResult {
  matchId: number;
  winnerId: number | null;
  p1: PlayerResult;
  p2: PlayerResult;
}

interface LocationState {
  result: GameResult;
  userId: number;
  players: {
    player1: { id: number; username: string } | null;
    player2: { id: number; username: string } | null;
  };
}

function formatTime(iso: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleTimeString('ko-KR'); // 예: "2025-03-20T13:45:00Z" -> "22:45:00" (한국 시간)
}
