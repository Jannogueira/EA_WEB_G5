import axios, { CanceledError } from 'axios';

export default axios.create({
  //baseURL: 'https://jsonplaceholder.typicode.com',
  baseURL: 'http://localhost:1337',
})

export { CanceledError };