const normalizeBaseUrl = (value) => value.replace(/\/+$/, '')

export const getApiBaseUrl = () => {
  const explicitBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (explicitBaseUrl) {
    return normalizeBaseUrl(explicitBaseUrl)
  }

  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location

    if (
      hostname === 'eventcinity.com' ||
      hostname === 'www.eventcinity.com'
    ) {
      return 'https://api.eventcinity.com'
    }

    if (
      hostname === 'api.eventcinity.com' ||
      hostname.endsWith('.eventcinity.com')
    ) {
      return `${protocol}//api.eventcinity.com`
    }
  }

  return 'http://localhost:5000'
}

export const API_BASE_URL = getApiBaseUrl()
