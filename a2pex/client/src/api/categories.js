import axiosClient from './axiosClient';

export const fetchCategories = async () => {
  const { data } = await axiosClient.get('/categories');
  return data.categories;
};

export const createCategory = async (payload) => {
  const { data } = await axiosClient.post('/categories', payload);
  return data.category;
};

export const updateCategory = async (id, payload) => {
  const { data } = await axiosClient.put(`/categories/${id}`, payload);
  return data.category;
};

export const deleteCategory = async (id) => {
  const { data } = await axiosClient.delete(`/categories/${id}`);
  return data;
};
