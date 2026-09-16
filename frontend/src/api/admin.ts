import { request } from './client'
import type { AdminStats } from '../types/admin'

export function getAdminStats() {
  return request<AdminStats>('/admin/stats/')
}
