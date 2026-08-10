import axiosClient from './axiosClient';

export const createOrder = async (payload) => {
  const { data } = await axiosClient.post('/orders', payload);
  return data.order;
};

export const fetchOrders = async (params = {}) => {
  const { data } = await axiosClient.get('/orders', { params });
  return data; // { orders, pagination }
};

export const fetchOrderById = async (id) => {
  const { data } = await axiosClient.get(`/orders/${id}`);
  return data.order;
};

export const updateOrderStatus = async (id, status) => {
  const { data } = await axiosClient.patch(`/orders/${id}/status`, { status });
  return data;
};

export const deleteOrder = async (id) => {
  const { data } = await axiosClient.delete(`/orders/${id}`);
  return data;
};
