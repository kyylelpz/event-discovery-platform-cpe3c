export function Button({ children, onClick, variant = 'primary', className = '' }) {
  const baseStyles = 'px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg transition-colors';

  const variants = {
    primary: 'bg-[#2D3B15] text-[#FCFCFC] hover:bg-[#2D3B15]/90',
    secondary: 'bg-[#FCFCFC] text-[#020202] border border-[#C0C0C1] hover:border-[#2D3B15]',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
