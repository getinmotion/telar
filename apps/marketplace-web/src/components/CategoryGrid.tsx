import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import * as Icons from "lucide-react";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplaceCategories";

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {MARKETPLACE_CATEGORIES.map((category) => {
        const Icon = Icons[category.icon] as Icons.LucideIcon;
        return (
          <Link
            key={category.name}
            to={`/productos?categoria=${encodeURIComponent(category.name)}`}
            className="group"
          >
            <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br hover:border-primary/50">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-7 h-7 text-foreground" />
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
