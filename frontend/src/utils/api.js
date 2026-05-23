import axios from 'axios';

const getConfig = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  return {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  };
};

export const uploadFile = async (formData) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${user?.token}`,
    },
  };

  const { data } = await axios.post('/api/files/upload', formData, config);
  return data;
};

export const getFiles = async () => {
  const { data } = await axios.get('/api/files', getConfig());
  return data;
};

export const getAllFiles = async () => {
  const { data } = await axios.get('/api/files/all', getConfig());
  return data;
};

export const downloadFile = async (id) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  const config = {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
    responseType: 'blob',
  };

  const { data } = await axios.get(`/api/files/download/${id}`, config);
  return data;
};

export const deleteFile = async (id) => {
  const { data } = await axios.delete(`/api/files/${id}`, getConfig());
  return data;
};

export const getFilesByCategory = async (category) => {
  const { data } = await axios.get(`/api/files/category/${category}`, getConfig());
  return data;
};