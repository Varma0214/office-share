import axios from 'axios';

const API = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
export const searchUsers = (email) => API.get(`/users/search?email=${email}`);
export const getAllUsers = () => API.get('/users/all');

export default API;