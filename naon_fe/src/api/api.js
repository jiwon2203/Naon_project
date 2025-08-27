import axios from 'axios';
import { Platform } from 'react-native';

// 환경에 맞는 IP로 변경하세요
const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8080' // 안드로이드 에뮬레이터 10.207.17.171
    : 'http://localhost:8080'; // iOS 시뮬레이터

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

export default api;