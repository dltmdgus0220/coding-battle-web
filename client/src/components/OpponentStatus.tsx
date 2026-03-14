interface OpponentStatusProps {
  opponentName: string;
  hasSubmitted: boolean;
  result?: string;
}

export default function OpponentStatus({ opponentName, hasSubmitted, result }: OpponentStatusProps) {
  return (
    <div className="opponent-status">
      <span className="opponent-name">상대방: {opponentName}</span>
      {hasSubmitted ? (
        <span className={`status-badge ${result === 'Accepted' ? 'status-accepted' : 'status-wrong'}`}>
          {result === 'Accepted' ? '✅ 정답 제출' : '❌ 오답 제출'}
        </span>
      ) : (
        <span className="status-badge status-pending">⌛ 풀이 중...</span>
      )}
    </div>
  );
}
// div: 블록 요소, span: 인라인 요소