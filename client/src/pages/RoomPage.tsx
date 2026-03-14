import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProblem, submitCode } from '../api';
import { useSocket } from '../hooks/useSocket';
import CodeEditor from '../components/CodeEditor';
import ProblemPanel from '../components/ProblemPanel';
import Timer from '../components/Timer';
import OpponentStatus from '../components/OpponentStatus';

interface Problem {
  id: number;
  title: string;
  description: string;
  input_format: string;
  output_format: string;
  sample_input: string;
  sample_output: string;
  difficulty: string;
  time_limit_sec: number;
}

interface Player {
  id: number;
  username: string;
}

interface GameResult {
  matchId: number;
  winnerId: number | null;
  p1: { userId: number; status: string; submittedAt: string | null };
  p2: { userId: number; status: string; submittedAt: string | null };
}

const DEFAULT_CODE = `# 여기에 Python 코드를 작성하세요
`;

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const socket = useSocket();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const timeUpSentRef = useRef(false);
  // players를 ref로 관리해서 useEffect 재실행 방지
  const playersRef = useRef<{ player1: Player | null; player2: Player | null }>({
    player1: null,
    player2: null,
  });
  const gameStartedRef = useRef(false);

  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [gameStarted, setGameStarted] = useState(false);
  const [serverStartTime, setServerStartTime] = useState('');
  const [oppName, setOppName] = useState('대기 중...');
  const [opponent, setOpponent] = useState<{ submitted: boolean; result?: string }>({
    submitted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [waitingMsg, setWaitingMsg] = useState('상대방을 기다리는 중...');

  useEffect(() => {
    socket.emit('room:join', {
      roomId: parseInt(roomId!),
      userId: user.id,
      username: user.username,
    });

    socket.on('room:player_joined', ({ username }: { username: string }) => {
      setWaitingMsg(`${username}님이 입장했습니다! 게임 시작 중...`);
    });

    socket.on('room:game_start', async ({ problemId, serverTime, player1, player2 }: {
      problemId: number; serverTime: string; player1: Player; player2: Player;
    }) => {
      // 이미 게임이 시작됐으면 무시 (중복 이벤트 방지)
      if (gameStartedRef.current) return;
      gameStartedRef.current = true;

      playersRef.current = { player1, player2 };
      const opp = player1.id === user.id ? player2 : player1;
      setOppName(opp.username);
      setServerStartTime(serverTime);
      setGameStarted(true);

      try {
        const res = await getProblem(problemId);
        setProblem(res.data);
      } catch {
        console.error('문제 로드 실패');
      }
    });

    socket.on('room:opponent_submitted', ({ judgeStatus }: { judgeStatus: string }) => {
      setOpponent({ submitted: true, result: judgeStatus });
    });

    socket.on('room:result', (result: GameResult) => {
      navigate(`/result/${result.matchId}`, {
        state: { result, userId: user.id, players: playersRef.current },
      });
    });

    socket.on('room:time_up', () => {
      navigate('/lobby');
    });

    return () => {
      socket.off('room:player_joined');
      socket.off('room:game_start');
      socket.off('room:opponent_submitted');
      socket.off('room:result');
      socket.off('room:time_up');
    };
  // players를 의도적으로 useEffect 에서 뺀 거임. 
  }, [socket, roomId]);

  const handleTimeUp = useCallback(() => {
    if (timeUpSentRef.current) return;
    timeUpSentRef.current = true;
    socket.emit('room:time_up', { roomId: parseInt(roomId!) }); // roomSocket.ts에서 받음
  }, [socket, roomId]);

  const handleSubmit = async () => {
    if (!problem || submitted || submitting) return;
    setSubmitting(true);
    try {
      await submitCode({ room_id: parseInt(roomId!), problem_id: problem.id, code });
      setSubmitted(true);
    } catch (err) {
      console.error('제출 오류:', err);
      alert('제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!gameStarted) {
    return (
      <div className="waiting-screen">
        <div className="waiting-card">
          <h2>⚔️ 코딩겨루기</h2>
          <p className="waiting-msg">{waitingMsg}</p>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  const opp = playersRef.current.player1?.id === user.id
    ? playersRef.current.player2
    : playersRef.current.player1;

  return (
    <div className="room-container">
      <header className="room-header">
        <div className="room-header-left">
          <span className="player-name my-player">👤 {user.username}</span>
          <span className="vs-text">VS</span>
          <span className="player-name">{opp?.username || '???'}</span>
        </div>
        <div className="room-header-center">
          {problem && (
            <Timer
              timeLimitSec={problem.time_limit_sec}
              serverStartTime={serverStartTime}
              onTimeUp={handleTimeUp}
            />
          )}
        </div>
        <div className="room-header-right">
          <OpponentStatus
            opponentName={oppName}
            hasSubmitted={opponent.submitted}
            result={opponent.result}
          />
        </div>
      </header>

      <div className="room-body">
        <div className="problem-panel-wrapper">
          {problem && <ProblemPanel problem={problem} />}
        </div>
        <div className="editor-wrapper">
          <CodeEditor value={code} onChange={setCode} height="100%" />
          <div className="editor-footer">
            {submitted ? (
              <div className="submitted-msg">✅ 제출 완료! 상대방을 기다리는 중...</div>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || submitted}
                className="btn-submit"
              >
                {submitting ? '채점 중...' : '제출하기'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
