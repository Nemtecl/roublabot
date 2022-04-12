import axios from 'axios';

export const setup = () => {
  axios.defaults.baseURL = process.env.METAMOB_API;
  axios.defaults.headers.common.Accept = 'application/json';
  axios.defaults.headers['HTTP-X-APIKEY'] = process.env.METAMOB_API_KEY;

  axios.interceptors.response.use((r) => r.data);
};
