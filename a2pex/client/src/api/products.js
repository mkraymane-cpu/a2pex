import axiosClient from './axiosClient';

export const fetchProducts = async (params = {}) => {
  const { data } = await axiosClient.get('/products', { params });
  return data; // { products, pagination }
};

export const fetchProductByIdOrSlug = async (idOrSlug) => {
  const { data } = await axiosClient.get(`/products/${idOrSlug}`);
  return data.product;
};

export const fetchRelatedProducts = async (id) => {
  const { data } = await axiosClient.get(`/products/${id}/related`);
  return data.products;
};

export const createProduct = async (payload) => {
  const { data } = await axiosClient.post('/products', payload);
  return data.product;
};

export const updateProduct = async (id, payload) => {
  const { data } = await axiosClient.put(`/products/${id}`, payload);
  return data.product;
};

export const deleteProduct = async (id) => {
  const { data } = await axiosClient.delete(`/products/${id}`);
  return data;
};
