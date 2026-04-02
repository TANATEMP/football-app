import axios from "axios";

// ✅ ตั้งค่า API URL ที่เดียว — เปลี่ยนตรงนี้แล้วมีผลทั้งโปรเจกต์
export const API_URL = "http://localhost:3000/api/v1";

// ✅ Axios Instance พร้อม baseURL สำหรับใช้ทั่วทั้งแอป
const api = axios.create({
  baseURL: API_URL,
});

// ✅ Interceptor: แนบ Token อัตโนมัติทุก Request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
