import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    cover?: { url?: string; alternativeText?: string };
  };
  variant?: "home" | "blog";
}

export function ArticleCard({ article, variant = "blog" }: ArticleCardProps) {
  const imageUrl = article.cover?.url || '';
  const aspectClass = variant === "home" ? "aspect-[4/3]" : "aspect-[16/10]";

  return (
    <Link to={`/blog/${article.slug}`}>
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full">
        <div className={`relative overflow-hidden ${aspectClass}`}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={article.cover?.alternativeText || article.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Sin imagen</span>
            </div>
          )}
        </div>
        <CardContent className="p-6 space-y-3">
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-xl">
            {article.title}
          </h3>
          <p className="text-muted-foreground line-clamp-3 text-sm">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-1 text-primary font-medium text-sm pt-2 group-hover:gap-2 transition-all">
            <span>Leer más</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
