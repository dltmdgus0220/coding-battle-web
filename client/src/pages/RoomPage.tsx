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
