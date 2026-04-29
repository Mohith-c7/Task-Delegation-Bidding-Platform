import api from './api'

export const operationsService = {
  async getManagerQueue() {
    const response = await api.get('/manager/queue')
    return response.data.data
  },

  async getWorkloadSummary() {
    const response = await api.get('/workload/me')
    return response.data.data
  },
}
