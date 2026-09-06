import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-col items-center justify-center min-h-screen px-4 text-center outline-none"
      aria-labelledby="not-found-title"
    >
      <h1
        id="not-found-title"
        className="text-6xl font-extrabold text-gray-900 mb-2 tracking-tight"
      >
        404
      </h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Ruta no encontrada
      </h2>
      <p className="text-gray-500 max-w-sm mb-8">
        La página que intentas consultar no existe o fue movida. Si buscabas un
        Pokémon, prueba desde la Pokédex.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 transition-colors"
        >
          Volver al inicio
        </Link>
        <Link
          href="/pokedex"
          className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-200 transition-colors"
        >
          Ir a la Pokédex
        </Link>
      </div>
    </main>
  );
}
