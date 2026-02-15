interface LogoProps {
  size?: 'sm' | 'lg'
}

export default function Logo({ size = 'lg' }: LogoProps) {
  const isLg = size === 'lg'

  return (
    <div className={`flex items-center gap-${isLg ? '3' : '2'} select-none`}>
      {/* Icone SVG */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={isLg ? 'w-11 h-11' : 'w-7 h-7'}
      >
        {/* Etiqueta de preco */}
        <rect x="4" y="8" width="28" height="32" rx="4" fill="#3B82F6" />
        <rect x="4" y="8" width="28" height="32" rx="4" fill="url(#grad1)" />
        
        {/* Furo da etiqueta */}
        <circle cx="18" cy="16" r="3" fill="white" opacity="0.9" />
        
        {/* Cifrao $ */}
        <text x="18" y="35" textAnchor="middle" fill="white" fontSize="16" fontWeight="700" fontFamily="system-ui">$</text>
        
        {/* Lupa sobreposta */}
        <circle cx="34" cy="14" r="8" stroke="#10B981" strokeWidth="3" fill="white" />
        <line x1="39.5" y1="19.5" x2="45" y2="25" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
        
        {/* Brilho na lupa */}
        <circle cx="31.5" cy="11.5" r="2" fill="#10B981" opacity="0.2" />

        {/* Gradiente */}
        <defs>
          <linearGradient id="grad1" x1="4" y1="8" x2="32" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Texto */}
      <div className={isLg ? 'text-[32px]' : 'text-lg'}>
        <span className="font-semibold text-gray-800 tracking-tight">
          Busca
        </span>
        <span className="font-semibold text-blue-500 tracking-tight">
          Precos
        </span>
      </div>
    </div>
  )
}
