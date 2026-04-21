const normalizeBaseUrl = (value) => value.replace(/\/+$/, '')
const HOSTED_BACKEND_FALLBACK = 'https://mediumaquamarine-hare-514275.hostingersite.com'

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
      return HOSTED_BACKEND_FALLBACK
    }

    if (hostname === 'api.eventcinity.com') {
      return `${protocol}//api.eventcinity.com`
    }

    if (hostname.endsWith('.eventcinity.com')) {
      return HOSTED_BACKEND_FALLBACK
    }
  }

  return 'http://localhost:5000'
}

export const API_BASE_URL = getApiBaseUrl()
