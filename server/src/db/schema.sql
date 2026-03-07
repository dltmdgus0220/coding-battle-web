-- 유저 테이블
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 문제 테이블
CREATE TABLE IF NOT EXISTS problems (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  input_format TEXT NOT NULL,
  output_format TEXT NOT NULL,
  sample_input TEXT NOT NULL,
  sample_output TEXT NOT NULL,
  difficulty VARCHAR(10) CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
  time_limit_sec INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 테스트케이스 (비공개 채점용 포함)
CREATE TABLE IF NOT EXISTS test_cases (
  id SERIAL PRIMARY KEY,
  problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_sample BOOLEAN DEFAULT FALSE
);

-- 방 테이블
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('waiting', 'in_progress', 'finished')) DEFAULT 'waiting',
  problem_id INTEGER REFERENCES problems(id),
  player1_id INTEGER REFERENCES users(id),
  player2_id INTEGER REFERENCES users(id),
  game_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 제출 내역
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  room_id INTEGER REFERENCES rooms(id),
  problem_id INTEGER REFERENCES problems(id),
  code TEXT NOT NULL,
  language VARCHAR(20) DEFAULT 'python',
  judge_status VARCHAR(30),
  passed_cases INTEGER DEFAULT 0,
  total_cases INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 매치 결과
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id) UNIQUE,
  winner_id INTEGER REFERENCES users(id),
  p1_submitted_at TIMESTAMPTZ,
  p2_submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
