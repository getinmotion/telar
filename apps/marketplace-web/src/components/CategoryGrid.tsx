import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import * as Icons from "lucide-react";
import { useMarketplaceCategories } from "@/hooks/useMarketplaceCategories";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryGrid() {
  const { categories, loading } = useMarketplaceCategories();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-6 h-full">
            <Skeleton className="w-14 h-14 rounded-xl mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category) => {
        const Icon = Icons[category.icon as keyof typeof Icons] as Icons.LucideIcon;
        return (
          <Link
            key={category.name}
            to={`/productos?categoria=${encodeURIComponent(category.name)}`}
            className="group"
          >
            <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br hover:border-primary/50">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {Icon && <Icon className="w-7 h-7 text-foreground" />}
              </div>
              
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
