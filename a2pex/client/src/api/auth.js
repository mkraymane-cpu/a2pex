import axiosClient from './axiosClient';

export const loginAdmin = async (username, password) => {
  const { data } = await axiosClient.post('/auth/login', { username, password });
  return data; // { token, admin }
};

export const fetchCurrentAdmin = async () => {
  const { data } = await axiosClient.get('/auth/me');
  return data.admin;
};
