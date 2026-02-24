import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import CategoryGrid from "@/components/CategoryGrid";

export default function Categories() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Explora por Categoría
          </h1>
          <p className="text-lg text-muted-foreground">
            Descubre artesanías colombianas organizadas por su uso y función.
            Cada categoría está curada para ayudarte a encontrar exactamente lo que buscas.
          </p>
        </div>

        <CategoryGrid />
      </main>

      <Footer />
    </div>
  );
}
