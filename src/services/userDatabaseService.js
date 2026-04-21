const USER_DATABASE_KEY = 'eventcinity_user_database_v1'
const INTERACTION_KEYS = ['hearted', 'saved', 'attending']

const isBrowser = typeof window !== 'undefined'

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

const normalizeList = (values) =>
  Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => String(value || '').trim())
        .filter(Boolean),
    ),
  )

export const buildEmptyInteractions = () => ({
  hearted: [],
  saved: [],
  attending: [],
})

const normalizeInteractions = (value = {}) =>
  INTERACTION_KEYS.reduce(
    (result, key) => ({
      ...result,
      [key]: normalizeList(value?.[key]),
    }),
    buildEmptyInteractions(),
  )

const readDatabase = () => {
  if (!isBrowser) {
    return { users: {} }
  }

  try {
    const parsedValue = JSON.parse(localStorage.getItem(USER_DATABASE_KEY) || '{}')
    return {
      users:
        parsedValue && typeof parsedValue === 'object' && parsedValue.users
          ? parsedValue.users
          : {},
    }
  } catch {
    return { users: {} }
  }
}

const writeDatabase = (database) => {
  if (!isBrowser) {
    return
  }

  try {
    localStorage.setItem(USER_DATABASE_KEY, JSON.stringify(database))
  } catch (error) {
    console.warn('Unable to persist the user database locally:', error)
  }
}

const buildUserRecord = (email, record = {}) => ({
  email: normalizeEmail(email),
  interests: normalizeList(record.interests),
  interactions: normalizeInteractions(record.interactions),
  updatedAt: String(record.updatedAt || '').trim() || new Date().toISOString(),
})

const upsertUserRecord = (email, transformRecord) => {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    return null
  }

  const database = readDatabase()
  const currentRecord = buildUserRecord(normalizedEmail, database.users[normalizedEmail])
  const nextRecord = buildUserRecord(normalizedEmail, transformRecord(currentRecord) || currentRecord)

  database.users[normalizedEmail] = nextRecord
  writeDatabase(database)

  return nextRecord
}

export const syncUserDatabaseProfile = (user = {}) =>
  upsertUserRecord(user.email, (currentRecord) => ({
    ...currentRecord,
    interests:
      Array.isArray(user.interests) && user.interests.length > 0
        ? user.interests
        : currentRecord.interests,
    updatedAt: new Date().toISOString(),
  }))

export const saveUserInterests = (email, interests) =>
  upsertUserRecord(email, (currentRecord) => ({
    ...currentRecord,
    interests,
    updatedAt: new Date().toISOString(),
  }))

export const getUserInteractions = (email) => {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    return buildEmptyInteractions()
  }

  const database = readDatabase()
  return buildUserRecord(normalizedEmail, database.users[normalizedEmail]).interactions
}

export const saveUserInteractions = (email, interactions) =>
  upsertUserRecord(email, (currentRecord) => ({
    ...currentRecord,
    interactions,
    updatedAt: new Date().toISOString(),
  }))
