// File: frontend/src/services/emailLogService.js
import axios from 'axios';
const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export function fetchEmailLogs() {
  return axios.get(`${API}/api/email-logs`).then(res => res.data);
}
