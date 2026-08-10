import axiosClient from './axiosClient';

export const uploadImages = async (files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('images', file));

  const { data } = await axiosClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.urls; // string[]
};
