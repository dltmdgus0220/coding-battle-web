import { useState, useEffect } from 'react';

interface TimerProps {
  timeLimitSec: number;
  serverStartTime: string;
  onTimeUp: () => void; // RoomPage.tsx(부모 컴포넌트)에서 handlTimeUp 함수 전달
}

export default function Timer({ timeLimitSec, serverStartTime, onTimeUp }: TimerProps) {
  const [remaining, setRemaining] = useState(timeLimitSec);

  useEffect(() => { 
    const startMs = new Date(serverStartTime).getTime(); // 서버 시작 시간 계산
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startMs) / 1000); // 현재시간과 시작시간 차이 계산
      const rem = Math.max(0, timeLimitSec - elapsed); // 남은 시간 계산
      setRemaining(rem); // 상태 업데이트
      if (rem === 0) onTimeUp(); // 제출 여부 확인 후 결과 저장
    };
    tick(); // 첫 실행
    const interval = setInterval(tick, 500); // setInterval: js 내장함수. 0.5초마다 tick 함수 반복 실행. 
    return () => clearInterval(interval); // clearInterval: js 내장함수. setInterval 중지
  }, [serverStartTime, timeLimitSec, onTimeUp]); // 배열 내 변수 중 하나라도 바뀌면 Timer 함수 실행

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isUrgent = remaining <= 10;

  return (
    <div className={`timer ${isUrgent ? 'timer-urgent' : ''}`}> 
      ⏱ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  ); // timer-urgent: css에서 빨간색으로 표시하기 위함. padStart: 말그대로 패딩 추가. 예를 들어 3초면 03초 이렇게
}
