export const DEFAULT_PROFILE_PRIVACY = {
  hideEmail: false,
  hideContact: false,
  hideFollowers: false,
  hideFollowing: false,
}

const PROFILE_PRIVACY_STORAGE_KEY = 'eventcinity_profile_privacy'

const parsePrivacyValue = (privacy) => {
  if (typeof privacy !== 'string') {
    return privacy || {}
  }

  try {
    const parsedPrivacy = JSON.parse(privacy)
    return parsedPrivacy && typeof parsedPrivacy === 'object' ? parsedPrivacy : {}
  } catch {
    return {}
  }
}

export const normalizeProfilePrivacy = (privacy = {}) => {
  const parsedPrivacy = parsePrivacyValue(privacy)

  return {
    hideEmail: Boolean(parsedPrivacy.hideEmail || parsedPrivacy.emailHidden),
    hideContact: Boolean(parsedPrivacy.hideContact || parsedPrivacy.contactHidden),
    hideFollowers: Boolean(parsedPrivacy.hideFollowers || parsedPrivacy.followersHidden),
    hideFollowing: Boolean(parsedPrivacy.hideFollowing || parsedPrivacy.followingHidden),
  }
}

export const getProfilePrivacyKey = (profile = {}) =>
  String(profile.username || profile.email || profile.id || '')
    .trim()
    .toLowerCase()

const getProfilePrivacyKeys = (profile = {}) =>
  [profile.username, profile.email, profile.id]
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean)

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key)

export const hasProfilePrivacy = (profile = {}) => {
  const parsedPrivacy = parsePrivacyValue(profile.privacy)

  return (
    hasOwn(profile, 'hideEmail') ||
    hasOwn(profile, 'emailHidden') ||
    hasOwn(profile, 'hideContact') ||
    hasOwn(profile, 'contactHidden') ||
    hasOwn(profile, 'hideFollowers') ||
    hasOwn(profile, 'followersHidden') ||
    hasOwn(profile, 'hideFollowing') ||
    hasOwn(profile, 'followingHidden') ||
    hasOwn(parsedPrivacy, 'hideEmail') ||
    hasOwn(parsedPrivacy, 'emailHidden') ||
    hasOwn(parsedPrivacy, 'hideContact') ||
    hasOwn(parsedPrivacy, 'contactHidden') ||
    hasOwn(parsedPrivacy, 'hideFollowers') ||
    hasOwn(parsedPrivacy, 'followersHidden') ||
    hasOwn(parsedPrivacy, 'hideFollowing') ||
    hasOwn(parsedPrivacy, 'followingHidden')
  )
}

const readStoredPrivacyMap = () => {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const parsedValue = JSON.parse(
      window.localStorage.getItem(PROFILE_PRIVACY_STORAGE_KEY) || '{}',
    )

    return parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)
      ? parsedValue
      : {}
  } catch {
    return {}
  }
}

export const getStoredProfilePrivacy = (profile = {}) => {
  const privacyKeys = getProfilePrivacyKeys(profile)

  if (!privacyKeys.length) {
    return null
  }

  const storedPrivacyMap = readStoredPrivacyMap()
  const storedPrivacy = privacyKeys.map((privacyKey) => storedPrivacyMap[privacyKey]).find(Boolean)
  return storedPrivacy ? normalizeProfilePrivacy(storedPrivacy) : null
}

export const saveStoredProfilePrivacy = (profile = {}, privacy = {}) => {
  if (typeof window === 'undefined') {
    return
  }

  const privacyKeys = getProfilePrivacyKeys(profile)

  if (!privacyKeys.length) {
    return
  }

  const storedPrivacyMap = readStoredPrivacyMap()
  const normalizedPrivacy = normalizeProfilePrivacy(privacy)
  privacyKeys.forEach((privacyKey) => {
    storedPrivacyMap[privacyKey] = normalizedPrivacy
  })
  window.localStorage.setItem(PROFILE_PRIVACY_STORAGE_KEY, JSON.stringify(storedPrivacyMap))
}

export const resolveProfilePrivacy = (profile = {}, fallbackPrivacy = null) => {
  const directPrivacy = profile.privacy !== undefined ? profile.privacy : profile
  const storedPrivacy = getStoredProfilePrivacy(profile)

  if (hasProfilePrivacy(profile)) {
    return normalizeProfilePrivacy(directPrivacy)
  }

  return storedPrivacy || fallbackPrivacy || normalizeProfilePrivacy(directPrivacy)
}
