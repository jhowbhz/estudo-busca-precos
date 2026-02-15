import { Product } from '@/lib/api'
import PriceTag from './PriceTag'
import StoreLogo from './StoreLogo'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all p-3 group"
    >
      {/* Imagem */}
      <div className="aspect-[4/3] mb-3 bg-gray-50 rounded-lg overflow-hidden relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          </div>
        )}

        {/* Indisponivel */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Indisponivel
            </span>
          </div>
        )}
      </div>

      {/* Loja */}
      <div className="mb-1.5">
        <StoreLogo store={product.store} displayName={product.storeDisplayName} />
      </div>

      {/* Nome */}
      <h3 className="text-[13px] leading-snug text-gray-700 line-clamp-2 mb-2 min-h-[36px] group-hover:text-blue-600 transition-colors">
        {product.name}
      </h3>

      {/* Avaliacao */}
      {product.rating && (
        <div className="flex items-center gap-1 mb-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-3 h-3 ${star <= Math.round(product.rating!) ? 'text-yellow-400' : 'text-gray-200'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          {product.reviewCount && (
            <span className="text-[11px] text-gray-400">({product.reviewCount})</span>
          )}
        </div>
      )}

      {/* Preco */}
      <PriceTag price={product.price} originalPrice={product.originalPrice} />

      {/* CTA sutil */}
      <div className="mt-2 text-[11px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
        Ver na loja →
      </div>
    </a>
  )
}
