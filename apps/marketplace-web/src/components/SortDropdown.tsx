import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption = 
  | "relevance" 
  | "price-asc" 
  | "price-desc" 
  | "newest" 
  | "rating";

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export const SortDropdown = ({ value, onChange }: SortDropdownProps) => {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="relevance">Relevancia</SelectItem>
          <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
          <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
          <SelectItem value="newest">Más recientes</SelectItem>
          <SelectItem value="rating">Mejor valorados</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
