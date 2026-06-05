import api from './axios';

export const caseApi = {
  getAll: () => api.get('/cases'),
  getById: (id) => api.get(`/cases/${id}`),
  create: (data) => api.post('/cases', data),
  update: (id, data) => api.put(`/cases/${id}`, data),

  addPerson: (caseId, data) => api.post(`/cases/${caseId}/persons`, data),
  addEvidence: (caseId, data) => api.post(`/cases/${caseId}/evidence`, data),
  addSection: (caseId, data) => api.post(`/cases/${caseId}/sections`, data),
  deleteSection: (caseId, sectionId) => api.delete(`/cases/${caseId}/sections/${sectionId}`),
};

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};