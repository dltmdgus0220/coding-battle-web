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

function statusLabel(status: string): string {
  const map: Record<string, string> = { // Record: 딕셔너리
    Accepted: '✅ 정답',
    'Wrong Answer': '❌ 오답',
    'Time Limit Exceeded': '⏱ 시간 초과',
    'Runtime Error': '💥 런타임 오류',
    not_submitted: '🚫 미제출',
  };
  return map[status] || status;
}

export default function ResultPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  if (!state) {
    navigate('/lobby');
    return null;
  }

  const { result, userId, players } = state;
  const myId = userId;
  const myResult = result.p1.userId === myId ? result.p1 : result.p2;
  const oppResult = result.p1.userId === myId ? result.p2 : result.p1;
  const oppPlayer = players.player1?.id === myId ? players.player2 : players.player1;

  const isWin = result.winnerId === myId;
  const isDraw = result.winnerId === null;

  return (
    <div className="result-container">
      <div className="result-card">
        <div className={`result-banner ${isWin ? 'win' : isDraw ? 'draw' : 'lose'}`}>
          {isWin ? '🏆 승리!' : isDraw ? '🤝 무승부' : '😢 패배'}
        </div>

        <div className="result-scores">
          <div className="result-player my-result">
            <div className="result-player-name">나</div>
            <div className="result-status">{statusLabel(myResult.status)}</div>
            <div className="result-time">제출 시각: {formatTime(myResult.submittedAt)}</div>
          </div>
          <div className="result-vs">VS</div>
          <div className="result-player opp-result">
            <div className="result-player-name">{oppPlayer?.username || '상대방'}</div>
            <div className="result-status">{statusLabel(oppResult.status)}</div>
            <div className="result-time">제출 시각: {formatTime(oppResult.submittedAt)}</div>
          </div>
        </div>

        <div className="result-actions">
          <button
            onClick={() => navigate(`/review/${matchId}`, { state: { result, userId: myId, players } })}
            className="btn-review"
          >
            📄 코드 비교하기
          </button>
          <button onClick={() => navigate('/lobby')} className="btn-primary">
            🏠 로비로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
