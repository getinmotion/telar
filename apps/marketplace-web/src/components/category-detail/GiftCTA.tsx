import { Link } from "react-router-dom";

interface GiftCTAProps {
  title?: string;
  description?: string;
  linkTo?: string;
  imageUrl?: string;
}

export default function GiftCTA({
  title = "Piezas para regalar",
  description = "Seleccion curada de textiles artesanales para momentos especiales.",
  linkTo = "/giftcards",
  imageUrl,
}: GiftCTAProps) {
  return (
    <section className="max-w-[1400px] mx-auto px-6 mb-32">
      <div className="relative rounded-sm overflow-hidden h-[450px] flex items-center px-16 group">
        <div className="absolute inset-0 bg-[#e5e1d8]">
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
        <div className="relative z-10 max-w-xl">
          <h2 className="font-serif text-6xl mb-6 leading-tight text-charcoal">
            {title}
          </h2>
          <p className="text-xl mb-10 font-sans text-charcoal/80">
            {description}
          </p>
          <Link
            to={linkTo}
            className="bg-primary text-white px-12 py-5 font-bold text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-primary/90 transition-all font-sans inline-block"
          >
            VER TODO
          </Link>
        </div>
      </div>
    </section>
  );
}
