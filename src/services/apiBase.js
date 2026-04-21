const normalizeBaseUrl = (value) => value.replace(/\/+$/, '')
const LOCAL_API_BASE_URL = 'http://localhost:5000'
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1'])

export const isLocalHostname = (hostname = '') => LOCAL_HOSTNAMES.has(String(hostname || '').trim())

export const getApiBaseUrl = () => {
  const explicitBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (explicitBaseUrl) {
    return normalizeBaseUrl(explicitBaseUrl)
  }

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location

    if (isLocalHostname(hostname)) {
      return LOCAL_API_BASE_URL
    }

    return normalizeBaseUrl(origin)
  }

  return LOCAL_API_BASE_URL
}

export const API_BASE_URL = getApiBaseUrl()
