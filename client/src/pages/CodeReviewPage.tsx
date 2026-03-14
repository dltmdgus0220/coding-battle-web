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
