// authService.js
// Mock auth using localStorage. Swap these functions with real API calls later.

const USERS_KEY = 'eventcinity_users'
const SESSION_KEY = 'eventcinity_session'

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  } catch {
    return {}
  }
}

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const setSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export const signUp = ({ email, password, name }) => {
  const users = getUsers()
  if (users[email]) {
    throw new Error('An account with this email already exists.')
  }
  const user = {
    email,
    name: name || email.split('@')[0],
    password, // NOTE: never store plain passwords in production — use hashed backend auth
    interests: [],
    createdAt: new Date().toISOString(),
  }
  users[email] = user
  saveUsers(users)
  const session = { email, name: user.name, interests: [] }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export const signIn = ({ email, password }) => {
  const users = getUsers()
  const user = users[email]
  if (!user) throw new Error('No account found with this email.')
  if (user.password !== password) throw new Error('Incorrect password.')
  const session = { email, name: user.name, interests: user.interests || [] }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export const signOut = () => {
  localStorage.removeItem(SESSION_KEY)
}

export const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

export const saveInterests = (email, interests) => {
  const users = getUsers()
  if (users[email]) {
    users[email].interests = interests
    saveUsers(users)
  }
  const session = getSession()
  if (session) {
    session.interests = interests
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
}
