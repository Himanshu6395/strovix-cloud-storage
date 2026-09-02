import api from './api.js';

export const shareApi = {
  create: (payload) => api.post('/shares', payload).then((r) => r.data),
  list: (resourceId) => api.get(`/shares/resource/${resourceId}`).then((r) => r.data),
  update: (shareId, role) => api.patch(`/shares/${shareId}`, { role }).then((r) => r.data),
  remove: (shareId) => api.delete(`/shares/${shareId}`).then((r) => r.data),
  sharedWithMe: () => api.get('/shares/me').then((r) => r.data),
};

export default shareApi;
