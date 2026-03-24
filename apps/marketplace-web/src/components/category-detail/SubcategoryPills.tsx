import { cn } from "@/lib/utils";

interface SubcategoryPillsProps {
  subcategories: string[];
  activeSubcategory: string | null;
  onSelect: (subcategory: string | null) => void;
}

export default function SubcategoryPills({
  subcategories,
  activeSubcategory,
  onSelect,
}: SubcategoryPillsProps) {
  return (
    <section className="max-w-[1400px] mx-auto px-6 mb-16 overflow-hidden">
      <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "px-8 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap rounded-full font-sans transition-colors",
            activeSubcategory === null
              ? "bg-primary text-white"
              : "border border-charcoal/10 hover:border-primary text-charcoal"
          )}
        >
          Todos
        </button>
        {subcategories.map((sub) => (
          <button
            key={sub}
            onClick={() => onSelect(sub)}
            className={cn(
              "px-8 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap rounded-full font-sans transition-colors",
              activeSubcategory === sub
                ? "bg-primary text-white"
                : "border border-charcoal/10 hover:border-primary text-charcoal"
            )}
          >
            {sub}
          </button>
        ))}
      </div>
    </section>
  );
}
