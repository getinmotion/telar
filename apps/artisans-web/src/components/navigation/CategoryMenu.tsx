import React from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/useCategories';
import { ProductCategory } from '@/types/category';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CategoryMenu: React.FC = () => {
  const { categories, loading } = useCategories();
  const navigate = useNavigate();

  const handleCategoryClick = (category: ProductCategory) => {
    navigate(`/tienda?category=${category.slug}`);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-4 w-20 bg-muted rounded"></div>
        <div className="h-4 w-16 bg-muted rounded"></div>
        <div className="h-4 w-24 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {categories.map((category) => (
          <NavigationMenuItem key={category.id}>
            {category.children && category.children.length > 0 ? (
              <>
                <NavigationMenuTrigger className="hover-glow">
                  {category.name}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] glass-panel">
                    <div className="row-span-3">
                      <NavigationMenuLink asChild>
                        <button
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/50 to-primary p-6 no-underline outline-none focus:shadow-md hover-glow transition-all duration-300"
                          onClick={() => handleCategoryClick(category)}
                        >
                          <div className="mb-2 mt-4 text-lg font-medium text-primary-foreground">
                            {category.name}
                          </div>
                          <p className="text-sm leading-tight text-primary-foreground/90">
                            {category.description}
                          </p>
                        </button>
                      </NavigationMenuLink>
                    </div>
                    <div className="grid gap-2">
                      {category.children.map((subcategory) => (
                        <NavigationMenuLink key={subcategory.id} asChild>
                          <button
                            className="flex items-center gap-2 select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-left"
                            onClick={() => handleCategoryClick(subcategory)}
                          >
                            <div>
                              <div className="text-sm font-medium leading-none">
                                {subcategory.name}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {subcategory.description}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink asChild>
                <button
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 hover-glow"
                  onClick={() => handleCategoryClick(category)}
                >
                  {category.name}
                </button>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <button
              className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 hover-glow"
              onClick={() => navigate('/tienda')}
            >
              Ver Todo
              <Badge variant="secondary" className="ml-2">
                Nuevo
              </Badge>
            </button>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};