import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRooms, createRoom, joinRoom } from '../api';

interface Room {
  id: number;
  name: string;
  status: string;
  player1_name: string;
  player2_name: string | null;
  created_at: string;
}

export default function LobbyPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}'); // 브라우저의 localStorage에 저장되어있는 유저 정보 불러옴.
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRooms = async () => {
    try {
      const res = await getRooms(); // 방 정보 조회
      setRooms(res.data); // 방 정보 state 갱신
    } catch {
      setError('방 목록을 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    fetchRooms(); // 초기 실행
    const interval = setInterval(fetchRooms, 3000); // 3초마다 반복 실행
    return () => clearInterval(interval); // interval 삭제
  }, []); // 

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return; // 방 이름 안적으면 방 생성 안됨.
    setLoading(true);
    setError('');
    try {
      const res = await createRoom({ name: newRoomName.trim() });
      const room = res.data;
      setNewRoomName(''); // 입력창 비우기
      navigate(`/room/${room.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || '방 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: number) => {
    try {
      await joinRoom(roomId);
      navigate(`/room/${roomId}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message; // as는 타입스크립트라서 붙은거고 err.response.data.message 의 형태일 수도 있지만 err.response
      setError(msg || '방 입장에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="lobby-container">
      <header className="lobby-header">
        <h1>⚔️ 코딩겨루기</h1>
        <div className="user-info">
          <span>안녕하세요, <strong>{user.username}</strong>님</span>
          <button onClick={handleLogout} className="btn-logout">로그아웃</button>
        </div>
      </header>

      <div className="lobby-content">
        <div className="create-room-section">
          <h2>방 만들기</h2>
          <div className="create-room-form">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
              placeholder="방 이름을 입력하세요"
              maxLength={100}
            />
            <button onClick={handleCreateRoom} disabled={loading || !newRoomName.trim()} className="btn-primary"> 
              {loading ? '생성 중...' : '방 만들기'}
            </button>
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div className="rooms-section">
          <div className="rooms-header">
            <h2>대기 중인 방</h2>
            <button onClick={fetchRooms} className="btn-refresh">새로고침</button>
          </div>
          {rooms.length === 0 ? (
            <p className="no-rooms">대기 중인 방이 없습니다. 방을 만들어보세요!</p>
          ) : (
            <div className="rooms-list">
              {rooms.map((room) => (
                <div key={room.id} className="room-card">
                  <div className="room-info">
                    <span className="room-name">{room.name}</span>
                    <span className="room-players">
                      {room.player1_name} vs {room.player2_name || '???'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    className="btn-join"
                  >
                    {room.player1_name === user.username ? '내 방' : '입장'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// onchange: 값이 바뀌면, onkeydown: 키보드 눌렀을 때