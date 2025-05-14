import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL
});

// Thêm interceptor để gửi token xác thực trong mỗi request
api.interceptors.request.use(
  (config) => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        if (userData && userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`;
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Building APIs
export const buildingApi = {
  getAll: (params?: any) => api.get('/buildings', { params }),
  getById: (id: number, params?: any) => api.get(`/buildings/${id}`, { params }),
  create: (data: any) => api.post('/buildings', data),
  update: (id: number, data: any) => api.patch(`/buildings/${id}`, data),
  delete: (id: number) => api.delete(`/buildings/${id}`),
  getRooms: (id: number) => api.get(`/buildings/${id}/rooms`),
  getAvailableRooms: (id: number) => api.get(`/buildings/${id}/available-rooms`)
};

// Room APIs
export const roomApi = {
  getAll: (params?: any) => api.get('/rooms', { 
    params: { 
      ...params,
      limit: params?.limit || 100  // Mặc định lấy 100 phòng
    } 
  }),
  search: (searchTerm: string, params?: any) => api.get('/rooms', {
    params: {
      ...params,
      search: searchTerm,
      limit: params?.limit || 100
    }
  }),
  getByBuilding: (buildingId: number) => api.get(`/rooms/by-building/${buildingId}`),
  getAvailableByBuilding: (buildingId: number) => api.get(`/rooms/available-by-building/${buildingId}`),
  getById: (id: number) => api.get(`/rooms/${id}`),
  create: (data: any) => api.post('/rooms', data),
  update: (id: number, data: any) => api.patch(`/rooms/${id}`, data),
  delete: (id: number) => api.delete(`/rooms/${id}`)
};

// Student APIs
export const studentApi = {
  getAll: (params?: any) => api.get('/students', { params }),
  getById: (id: number) => api.get(`/students/${id}`),
  create: (data: any) => api.post('/students', data),
  update: (id: number, data: any) => api.patch(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
  search: (query: string) => api.get(`/students/search?q=${query}`),
  getByStudentCode: (code: string) => api.get(`/students/by-student-code/${code}`),
  getByEmail: (email: string) => api.get(`/students/by-email/${email}`),
  getByStatus: (status: string) => api.get(`/students/by-status/${status}`),
  getByGender: (gender: string) => api.get(`/students/by-gender/${gender}`),
  getByClass: (className: string) => api.get(`/students/by-class/${className}`),
  updateStatus: (id: number, status: string) => api.patch(`/students/${id}/status`, { status }),
  getStatistics: () => api.get('/students/statistics'),
  countByStatus: () => api.get('/students/count-by-status'),
  countByGender: () => api.get('/students/count-by-gender'),
  countByClass: () => api.get('/students/count-by-class')
};

// Utilities APIs (ElecWater)
export const utilitiesApi = {
  getAll: () => api.get('/utilities'),
  getById: (id: number) => api.get(`/utilities/${id}`),
  create: (data: any) => api.post('/utilities', data),
  update: (id: number, data: any) => api.patch(`/utilities/${id}`, data),
  delete: (id: number) => api.delete(`/utilities/${id}`)
};

// For backward compatibility
export const elecWaterApi = utilitiesApi;

// System Log APIs
export const systemLogApi = {
  getAll: () => api.get('/system-log')
};

// For backward compatibility
export const auditLogApi = systemLogApi;

// RoomType APIs
export const roomTypeApi = {
  getAll: (params?: any) => api.get('/room-types', { params }),
  getById: (id: number) => api.get(`/room-types/${id}`),
  create: (data: any) => api.post('/room-types', data),
  update: (id: number, data: any) => api.patch(`/room-types/${id}`, data),
  delete: (id: number) => api.delete(`/room-types/${id}`),
  getByGender: (gender: string) => api.get(`/room-types/by-gender/${gender}`),
  getStatistics: () => api.get('/room-types/statistics'),
  getCountByGender: () => api.get('/room-types/count-by-gender')
};

// RoomRegistration APIs
export const roomRegistrationApi = {
  getAll: () => api.get('/room-registration'),
  getById: (id: number) => api.get(`/room-registration/${id}`),
  getByStudent: (studentId: number) => api.get(`/room-registration/student/${studentId}`),
  getByRoom: (roomId: number) => api.get(`/room-registration/room/${roomId}`),
  create: (data: any) => api.post('/room-registration', data),
  update: (id: number, data: any) => api.patch(`/room-registration/${id}`, data),
  delete: (id: number) => api.delete(`/room-registration/${id}`)
};

// PriceList APIs
export const priceListApi = {
  getAll: () => api.get('/price-list'),
  getById: (id: number) => api.get(`/price-list/${id}`),
  create: (data: any) => api.post('/price-list', data),
  update: (id: number, data: any) => api.patch(`/price-list/${id}`, data),
  delete: (id: number) => api.delete(`/price-list/${id}`)
}; 