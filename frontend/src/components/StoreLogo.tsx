interface StoreLogoProps {
  store: string
  displayName: string
}

const storeConfig: Record<string, { bg: string; text: string }> = {
  kabum: { bg: 'bg-orange-50', text: 'text-orange-600' },
  mercadolivre: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  magalu: { bg: 'bg-blue-50', text: 'text-blue-600' },
  amazon: { bg: 'bg-orange-50', text: 'text-orange-700' },
  casasbahia: { bg: 'bg-blue-50', text: 'text-blue-700' },
  fastshop: { bg: 'bg-red-50', text: 'text-red-600' },
  samsung: { bg: 'bg-blue-50', text: 'text-blue-800' },
  apple: { bg: 'bg-gray-100', text: 'text-gray-700' },
  lenovo: { bg: 'bg-red-50', text: 'text-red-700' },
  dell: { bg: 'bg-blue-50', text: 'text-blue-600' },
  terabyte: { bg: 'bg-green-50', text: 'text-green-700' },
  pichau: { bg: 'bg-purple-50', text: 'text-purple-700' },
}

export default function StoreLogo({ store, displayName }: StoreLogoProps) {
  const config = storeConfig[store] || { bg: 'bg-gray-100', text: 'text-gray-600' }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${config.bg} ${config.text}`}>
      {displayName}
    </span>
  )
}
