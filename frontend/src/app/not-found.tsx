import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300 dark:text-gray-700">404</h1>
        <h2 className="text-3xl font-bold mt-4 mb-2">Página não encontrada</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          A página que você procura não existe
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar para a home
        </Link>
      </div>
    </div>
  )
}
