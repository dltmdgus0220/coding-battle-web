import axios from 'axios'; // axios: 브라우저에서 서버로 http 요청(post, get, put, delete 등)을 보내는 라이브러리

const api = axios.create({
  baseURL: 'http://localhost:4000/api', // 모든 요청의 기본 url
  withCredentials: true,
});

