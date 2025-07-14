// File: frontend/src/services/newsletterService.js
import axios from 'axios';
const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export function subscribeNewsletter(data) {
  return axios.post(`${API}/api/newsletter`, data).then(res => res.data);
}

export function fetchSubscribers() {
  return axios.get(`${API}/api/newsletter`).then(res => res.data);
}

export function sendCampaign(segment, subject, body) {
  return axios
    .post(`${API}/api/newsletter/campaign`, { segment, subject, body })
    .then(res => res.data);
}
