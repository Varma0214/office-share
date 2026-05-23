import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// File APIs
export const uploadFile = (formData, onProgress) =>
  API.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    }
  });

export const getMyFiles = () => API.get('/files/my');
export const getSharedFiles = () => API.get('/files/shared');
export const getAllFiles = () => API.get('/files/all');
export const deleteFile = (id) => API.delete(`/files/${id}`);
export const shareFile = (id, data) => API.put(`/files/${id}/share`, data);
export const downloadFile = (id) => `${window.location.origin}/api/files/download/${id}`;

// User APIs
export const searchUsers = (email) => API.get(`/users/search?email=${email}`);
export const getAllUsers = () => API.get('/users/all');

export default API;
