const normalizeText = (value) => String(value || '').trim()

const normalizeCompareValue = (value) => normalizeText(value).toLowerCase()

const getEmailLocalPart = (email) => normalizeText(email).split('@')[0] || ''

export const getUserDisplayName = (user = {}) =>
  normalizeText(user.username) ||
  normalizeText(user.name) ||
  getEmailLocalPart(user.email) ||
  'Eventcinity user'

export const getUserSecondaryLabel = (user = {}) => {
  const username = normalizeText(user.username)
  const name = normalizeText(user.name)
  const emailLocalPart = getEmailLocalPart(user.email)

  if (!name) {
    return ''
  }

  if (
    normalizeCompareValue(name) === normalizeCompareValue(username) ||
    normalizeCompareValue(name) === normalizeCompareValue(emailLocalPart)
  ) {
    return ''
  }

  return name
}
