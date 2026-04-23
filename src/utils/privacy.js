export const DEFAULT_PROFILE_PRIVACY = {
  hideEmail: false,
  hideContact: false,
  hideFollowers: false,
  hideFollowing: false,
}

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
