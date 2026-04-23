import { API_BASE_URL } from './apiBase.js'
import { getAuthRequestHeaders } from './authService.js'

const readResponseData = async (response) => {
  const rawText = await response.text()

  if (!rawText) {
    return {}
  }

  try {
    return JSON.parse(rawText)
  } catch {
    return { message: rawText }
  }
}

const isRecoverableNotificationError = (error) =>
  error?.name === 'TypeError' || [401, 403, 404, 405, 502, 503, 504].includes(error?.status)

const normalizeNotification = (notification = {}) => ({
  id: String(notification.id || notification._id || '').trim(),
  kind: String(notification.kind || notification.type || 'notification').trim(),
  title: String(notification.title || '').trim(),
  body: String(notification.body || '').trim(),
  eventId: String(notification.eventId || '').trim(),
  username: String(notification.username || '').trim().toLowerCase(),
  profilePic: String(notification.profilePic || '').trim(),
  isRead: Boolean(notification.isRead),
  isPersistent: true,
  dateSortKey: Date.parse(notification.createdAt || notification.updatedAt || '') || 0,
  sortDirection: 'desc',
})

const requestNotifications = async (path = '', options = {}) => {
  const response = await fetch(`${API_BASE_URL}/api/notifications${path}`, {
    credentials: 'include',
    headers: getAuthRequestHeaders({
      Accept: 'application/json',
      ...(options.headers || {}),
    }),
    ...options,
  })
  const data = await readResponseData(response)

  if (!response.ok || data?.success === false) {
    const error = new Error(data.message || 'Unable to load notifications.')
    error.status = response.status
    throw error
  }

  return data
}

export const fetchNotifications = async () => {
  try {
    const payload = await requestNotifications()
    const records = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.notifications)
        ? payload.notifications
        : []

    return records.map((notification) => normalizeNotification(notification)).filter((item) => item.id)
  } catch (error) {
    if (!isRecoverableNotificationError(error)) {
      throw error
    }

    return []
  }
}

export const markNotificationAsRead = async (notificationId) => {
  const normalizedNotificationId = String(notificationId || '').trim()

  if (!normalizedNotificationId) {
    return null
  }

  try {
    const payload = await requestNotifications(`/${encodeURIComponent(normalizedNotificationId)}/read`, {
      method: 'PATCH',
    })

    return normalizeNotification(payload?.data || payload)
  } catch (error) {
    if (!isRecoverableNotificationError(error)) {
      throw error
    }

    return null
  }
}

export const removeNotification = async (notificationId) => {
  const normalizedNotificationId = String(notificationId || '').trim()

  if (!normalizedNotificationId) {
    return false
  }

  try {
    await requestNotifications(`/${encodeURIComponent(normalizedNotificationId)}`, {
      method: 'DELETE',
    })
    return true
  } catch (error) {
    if (!isRecoverableNotificationError(error)) {
      throw error
    }

    return false
  }
}
