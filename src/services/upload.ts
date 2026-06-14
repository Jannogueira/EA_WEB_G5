import axios from 'axios';
import { config } from '../config';

const API_URL = `${config.apiUrl}/upload`;

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const token = localStorage.getItem('accessToken');

  const response = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data; // { url: '...', public_id: '...' }
};
