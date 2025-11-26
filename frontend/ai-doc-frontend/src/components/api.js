// src/api.js
import axios from "axios";

export const BASE_URL = "https://ai-doc-backend-hecs.onrender.com/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
});
