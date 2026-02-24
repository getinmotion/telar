import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tag } from "lucide-react";

interface ProductTagsProps {
  tags?: string[];
}

export function ProductTags({ tags }: ProductTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="space-y-4 py-6">
      <div className="flex items-center gap-2">
        <Tag className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Técnicas Artesanales</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Este producto fue elaborado con las siguientes técnicas y materiales tradicionales:
      </p>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge 
            key={tag} 
            variant="secondary"
            className="px-3 py-1.5 text-sm font-normal"
          >
            {tag}
          </Badge>
        ))}
      </div>
      
      <Separator className="mt-6" />
    </div>
  );
}
