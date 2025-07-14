// File: frontend/src/services/emailTemplateService.js
import axios from 'axios';
const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export function fetchEmailTemplates() {
  return axios.get(`${API}/api/email-templates`).then(res => res.data);
}

export function updateEmailTemplate(key, tpl) {
  return axios.put(`${API}/api/email-templates/${key}`, tpl).then(res => res.data);
}
