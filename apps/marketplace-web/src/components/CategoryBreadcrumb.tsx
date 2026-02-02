import { Home, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { formatCategoryName } from "@/lib/categoryUtils";

interface CategoryBreadcrumbProps {
  categories?: string[];
  searchQuery?: string;
  onHomeClick?: () => void;
}

export const CategoryBreadcrumb = ({ categories, searchQuery, onHomeClick }: CategoryBreadcrumbProps) => {
  const hasActiveFilters = (categories && categories.length > 0) || searchQuery;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            {onHomeClick ? (
              <button onClick={onHomeClick} className="flex items-center gap-1 hover:text-primary transition-colors">
                <Home className="h-4 w-4" />
                <span>Inicio</span>
              </button>
            ) : (
              <Link to="/?reset=true" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Home className="h-4 w-4" />
                <span>Inicio</span>
              </Link>
            )}
          </BreadcrumbLink>
        </BreadcrumbItem>

        {searchQuery && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>
                Búsqueda: "{searchQuery}"
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {categories && categories.length > 0 && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>
                {categories.map((cat, index) => (
                  <span key={cat} className="inline-flex items-center">
                    {index > 0 && <span className="mx-1 text-muted-foreground">+</span>}
                    <span className="font-semibold">
                      {cat}
                    </span>
                  </span>
                ))}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
