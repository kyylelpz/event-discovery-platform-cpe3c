function UserAvatar({ name, imageUrl, size = 'md' }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

  if (imageUrl) {
    return <img className={`user-avatar user-avatar--${size}`} src={imageUrl} alt={name} />
  }

  return (
    <span className={`user-avatar user-avatar--${size}`} aria-hidden="true">
      {initials}
    </span>
  )
}

export default UserAvatar
