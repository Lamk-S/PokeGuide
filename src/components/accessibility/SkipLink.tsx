type SkipLinkProps = {
  targetId?: string;
  label?: string;
};

export function SkipLink({
  targetId = "main-content",
  label = "Saltar al contenido principal",
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:font-semibold focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
    >
      {label}
    </a>
  );
}
