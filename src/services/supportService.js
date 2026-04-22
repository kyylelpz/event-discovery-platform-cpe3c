import { API_BASE_URL } from './apiBase.js'
import { getSession } from './authService.js'

const SUPPORT_REQUESTS_KEY = 'eventcinity_support_requests'
const SUPPORT_ENDPOINTS = ['/api/support/contact', '/api/contact-support', '/api/support']

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

const getStoredSupportRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(SUPPORT_REQUESTS_KEY) || '[]')
  } catch {
    return []
  }
}

const saveStoredSupportRequests = (entries) => {
  localStorage.setItem(SUPPORT_REQUESTS_KEY, JSON.stringify(entries))
}

const buildSupportTicket = (submission) => ({
  id: `support-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  ...submission,
  createdAt: new Date().toISOString(),
})

const persistSupportRequestLocally = (submission) => {
  const nextTicket = buildSupportTicket(submission)
  const existingTickets = getStoredSupportRequests()
  saveStoredSupportRequests([nextTicket, ...existingTickets])

  return { ticket: nextTicket, delivery: 'local' }
}

export const submitSupportRequest = async (submission) => {
  const session = getSession()
  const normalizedSubmission = {
    name: String(submission?.name || '').trim(),
    email: String(submission?.email || '').trim().toLowerCase(),
    topic: String(submission?.topic || '').trim(),
    message: String(submission?.message || '').trim(),
    submittedBy:
      session?.username || String(session?.email || '').trim().toLowerCase() || 'guest',
  }

  for (const endpoint of SUPPORT_ENDPOINTS) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(normalizedSubmission),
      })

      const data = await readResponseData(response)

      if (!response.ok) {
        continue
      }

      const ticket =
        data.ticket ||
        data.data?.ticket ||
        data.data ||
        buildSupportTicket(normalizedSubmission)

      return {
        ticket,
        delivery: 'remote',
      }
    } catch {
      // Try the next endpoint before falling back to local persistence.
    }
  }

  return persistSupportRequestLocally(normalizedSubmission)
}
