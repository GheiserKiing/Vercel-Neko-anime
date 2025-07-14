// File: frontend/src/services/imageService.js
const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error('Error subiendo imagen: ' + txt);
  }
  const { url } = await res.json();
  return url;
}
