import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getSubmissionCode } from '../api'; // index.ts에 있음.
import CodeEditor from '../components/CodeEditor';

