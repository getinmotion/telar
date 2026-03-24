import { Link } from "react-router-dom";

interface EditorialStoryBlockProps {
  title: string;
  highlightText: string;
  description: string;
  imageUrl?: string;
  storyLink?: string;
  exploreLink?: string;
  exploreLinkLabel?: string;
}

export default function EditorialStoryBlock({
  title,
  highlightText,
  description,
  imageUrl,
  storyLink,
  exploreLink,
  exploreLinkLabel = "Explorar piezas",
}: EditorialStoryBlockProps) {
  return (
    <section className="bg-primary/5 py-32 mb-32">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="aspect-[5/6] w-full shadow-2xl rounded-sm overflow-hidden bg-[#e5e1d8]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#d1cdc3] to-transparent opacity-50" />
              </div>
            )}
          </div>
          <div className="space-y-10">
            <h2 className="text-5xl md:text-7xl font-serif leading-tight text-charcoal">
              {title} <br />
              <span className="italic">{highlightText}</span>
            </h2>
            <p className="text-xl text-charcoal/70 leading-relaxed font-sans font-light">
              {description}
            </p>
            <div className="flex flex-col sm:flex-row gap-8 pt-6">
              {storyLink && (
                <Link
                  to={storyLink}
                  className="text-[11px] font-bold uppercase tracking-[0.3em] border-b-2 border-primary pb-2 inline-block self-start hover:text-primary transition-colors font-sans"
                >
                  Conoce la historia
                </Link>
              )}
              {exploreLink && (
                <Link
                  to={exploreLink}
                  className="text-[11px] font-bold uppercase tracking-[0.3em] border-b-2 border-charcoal pb-2 inline-block self-start hover:text-primary hover:border-primary transition-colors font-sans"
                >
                  {exploreLinkLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
