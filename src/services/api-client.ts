import axios, { CanceledError } from 'axios';

export default axios.create({
  baseURL: 'http://localhost:1337/api', // <-- ¡ruta del backend! 
  withCredentials: true, // <-- cookies del refreshToken de omar
})

export { CanceledError };