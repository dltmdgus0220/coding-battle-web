import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getSubmissionCode } from '../api'; // index.ts에 있음.
import CodeEditor from '../components/CodeEditor';

interface LocationState {
  result: {
    matchId: number;
    winnerId: number | null;
    p1: { userId: number };
    p2: { userId: number };
  };
  userId: number;
  players: {
    player1: { id: number; username: string } | null;
    player2: { id: number; username: string } | null;
  };
}

interface CodeData {
  code: string | null;
  judge_status: string;
  passed_cases: number;
  total_cases: number;
}

export default function CodeReviewPage() {
  const { matchId } = useParams<{ matchId: string }>(); // ts라 복잡해보일뿐 const { matchId } = useParams(); 와 같음. url 뒤 동적 파라미터 가져오기.
  const navigate = useNavigate(); // 페이지를 이동시키는 react 훅
  const location = useLocation(); // 현재 페이지의 URL 정보 객체를 반환하는 훅
  const state = location.state as LocationState | null;

  const [myCode, setMyCode] = useState<CodeData | null>(null); // (null): state의 초기값
  const [oppCode, setOppCode] = useState<CodeData | null>(null);
  const [loading, setLoading] = useState(true); // 초기값을 보고 boolean으로 자동 추론하기 때문에 타입지정 안해도됨.

  useEffect(() => {
    if (!state || !matchId) { navigate('/lobby'); return; } // state가 없거나 matchId가 없으면 로비로 이동하고 종료.
    const { result, userId, players } = state;
    const myId = userId;
    const oppId = result.p1.userId === myId ? result.p2.userId : result.p1.userId;

    Promise.all([ // 아래 api 요청을 비동기로 수행
      getSubmissionCode(parseInt(matchId), myId), // index.ts에서 선언. 백엔드 서버로 get 요청
      getSubmissionCode(parseInt(matchId), oppId),
    ]).then(([myRes, oppRes]) => {
      setMyCode(myRes.data);
      setOppCode(oppRes.data);
    }).catch(console.error).finally(() => setLoading(false)); // 두개의 api 요청 중 하나라도 실패하면 false로 state 갱신
  }, [matchId, state, navigate]);

  if (!state) return null;

  const { userId, players } = state;
  const oppPlayer = players.player1?.id === userId ? players.player2 : players.player1;

  if (loading) return <div className="loading">코드 불러오는 중...</div>;

  return (
    <div className="review-container">
      <div className="review-header">
        <button onClick={() => navigate(-1)} className="btn-back">← 결과로 돌아가기</button>
        <h2>📄 코드 비교</h2>
      </div>
      <div className="review-body">
        <div className="review-panel">
          <div className="review-panel-header">
            <h3>내 코드</h3>
            {myCode && (
              <span className={`judge-badge ${myCode.judge_status === 'Accepted' ? 'accepted' : 'wrong'}`}>
                {myCode.judge_status} ({myCode.passed_cases}/{myCode.total_cases})
              </span>
            )}
          </div>
          <CodeEditor
            value={myCode?.code || '// 제출 내역이 없습니다.'}
            readOnly
            height="calc(100vh - 200px)"
          />
        </div>
        <div className="review-panel">
          <div className="review-panel-header">
            <h3>{oppPlayer?.username || '상대방'} 코드</h3>
            {oppCode && (
              <span className={`judge-badge ${oppCode.judge_status === 'Accepted' ? 'accepted' : 'wrong'}`}>
                {oppCode.judge_status} ({oppCode.passed_cases}/{oppCode.total_cases})
              </span>
            )}
          </div>
          <CodeEditor
            value={oppCode?.code || '// 제출 내역이 없습니다.'}
            readOnly
            height="calc(100vh - 200px)"
          />
        </div>
      </div>
    </div>
  );
}
