import { Link } from "react-router-dom";

interface CategoryEditorialHeaderProps {
  categoryName: string;
  categoryDescription: string;
  imageUrl?: string;
}

export default function CategoryEditorialHeader({
  categoryName,
  categoryDescription,
  imageUrl,
}: CategoryEditorialHeaderProps) {
  // Split name by "y" to style the second part in italic primary
  const parts = categoryName.split(" y ");
  const mainPart = parts[0] || categoryName;
  const accentPart = parts.length > 1 ? parts[1] : null;

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <nav className="flex text-[10px] uppercase tracking-widest text-charcoal/50 gap-2 font-sans">
          <Link
            to="/"
            className="hover:text-primary transition-colors"
          >
            Inicio
          </Link>
          <span>/</span>
          <span className="text-primary font-bold">{categoryName}</span>
        </nav>
      </div>

      {/* Editorial Header */}
      <section className="max-w-[1400px] mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-8 border-b border-charcoal/5">
          <div>
            <h1 className="text-5xl md:text-7xl leading-[0.85] font-serif mb-6 text-charcoal tracking-tight uppercase">
              {mainPart}
              {accentPart && (
                <>
                  <br />
                  <span className="italic text-primary">&amp; {accentPart}</span>
                </>
              )}
            </h1>
            <p className="text-sm text-charcoal/70 max-w-md font-sans leading-relaxed">
              {categoryDescription}
            </p>
          </div>
          <div className="aspect-[21/6] w-full rounded-sm overflow-hidden bg-[#e5e1d8]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={categoryName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#d1cdc3] to-transparent opacity-30" />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
