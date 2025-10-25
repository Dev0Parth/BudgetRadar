import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // change to just http://localhost:5000 if you didn't prefix /api
});

export default api;
