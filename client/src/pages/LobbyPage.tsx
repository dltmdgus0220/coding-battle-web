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
