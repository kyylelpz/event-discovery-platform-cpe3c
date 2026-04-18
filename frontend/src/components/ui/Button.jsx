export function PrimaryButton({ children, onClick, type = 'button', className = '' }) {
  return (
    <button
      className={`button button--primary ${className}`.trim()}
      type={type}
      onClick={onClick}
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
}) {
  return (
    <button
      className={`button button--secondary ${
        isActive ? 'button--secondary-active' : ''
      } ${className}`.trim()}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
