interface PriceTagProps {
  price: number
  originalPrice?: number | null
}

export default function PriceTag({ price, originalPrice }: PriceTagProps) {
  const formatPrice = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const hasDiscount = originalPrice && originalPrice > price
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className="text-lg font-semibold text-gray-900">
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-xs text-gray-400 line-through">
            {formatPrice(originalPrice)}
          </span>
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  )
}
