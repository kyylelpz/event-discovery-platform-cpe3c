function UserAvatar({ name, imageUrl, size = 'md' }) {
  const safeName = String(name || 'User').trim() || 'User'
  const initials = safeName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

  if (imageUrl) {
    return <img className={`user-avatar user-avatar--${size}`} src={imageUrl} alt={safeName} />
  }

  return (
    <span className={`user-avatar user-avatar--${size}`} aria-hidden="true">
      {initials}
    </span>
  )
}

export default UserAvatar
