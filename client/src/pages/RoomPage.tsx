import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProblem, submitCode } from '../api';
import { useSocket } from '../hooks/useSocket';
import CodeEditor from '../components/CodeEditor';
import ProblemPanel from '../components/ProblemPanel';
import Timer from '../components/Timer';
import OpponentStatus from '../components/OpponentStatus';

