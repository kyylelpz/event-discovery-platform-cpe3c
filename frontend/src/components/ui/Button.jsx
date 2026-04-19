export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
}) {
  return (
    <button
      className={`button button--primary ${className}`.trim()}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  onClick,
  type = 'button',
  isActive = false,
  className = '',
  disabled = false,
}) {
  return (
    <button
      className={`button button--secondary ${
        isActive ? 'button--secondary-active' : ''
      } ${className}`.trim()}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
