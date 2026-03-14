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

