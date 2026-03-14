import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // 브라우저가 원래 하려던 행동을 취소. submit을 하면 브라우저는 원래 새로고침을 하려고 하는데 이걸 취소하는 거임.
    setError('');
    setLoading(true);
    try {
      const res = await register({ username, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/lobby');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">⚔️ 코딩겨루기</h1>
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>닉네임</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="닉네임을 입력하세요"
              required
            />
          </div>
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
            />
          </div>
          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요 (6자 이상)"
              minLength={6}
              required
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <p className="auth-link">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}
