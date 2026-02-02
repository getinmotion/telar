-- FASE 1: Sistema de Inventario y Gestión de Productos
-- Tablas para variantes, materiales, BOM y movimientos de inventario

-- 1. Tabla de variantes de productos
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  option_values JSONB DEFAULT '{}'::jsonb, -- {"color": "Rojo", "talla": "M"}
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  cost DECIMAL(10,2), -- Costo de producción
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  weight DECIMAL(8,2),
  dimensions JSONB DEFAULT '{}'::jsonb, -- {"length": 10, "width": 5, "height": 2, "unit": "cm"}
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índices para product_variants
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_status ON product_variants(status);

-- 2. Tabla de materiales
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  unit TEXT DEFAULT 'unidad', -- "metro", "gramo", "unidad", "litro"
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  current_stock DECIMAL(10,2) DEFAULT 0,
  min_stock DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índices para materials
CREATE INDEX IF NOT EXISTS idx_materials_user_id ON materials(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(name);

-- 3. Tabla BOM (Bill of Materials) - Lista de materiales por producto/variante
CREATE TABLE IF NOT EXISTS bom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE NOT NULL,
  qty_per_unit DECIMAL(10,2) NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CHECK (product_id IS NOT NULL OR variant_id IS NOT NULL) -- Al menos uno debe estar presente
);

-- Índices para bom
CREATE INDEX IF NOT EXISTS idx_bom_product_id ON bom(product_id);
CREATE INDEX IF NOT EXISTS idx_bom_variant_id ON bom(variant_id);
CREATE INDEX IF NOT EXISTS idx_bom_material_id ON bom(material_id);

-- 4. Tabla de movimientos de inventario
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUST')),
  qty INTEGER NOT NULL,
  reason TEXT,
  ref_id UUID, -- order_id, adjustment_id, etc.
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índices para inventory_movements
CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant_id ON inventory_movements(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at DESC);

-- 5. Actualizar tabla products con nuevos campos
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS made_to_order BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS lead_time_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS production_time_hours DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS requires_customization BOOLEAN DEFAULT false;

-- 6. Trigger para actualizar updated_at en product_variants
CREATE OR REPLACE FUNCTION update_variant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_variant_updated_at();

-- 7. Trigger para actualizar updated_at en materials
CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. RLS Policies

-- Habilitar RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Políticas para product_variants
CREATE POLICY "Shop owners can manage their product variants"
ON product_variants FOR ALL
USING (
  product_id IN (
    SELECT p.id FROM products p
    JOIN artisan_shops s ON p.shop_id = s.id
    WHERE s.user_id = auth.uid()
  )
)
WITH CHECK (
  product_id IN (
    SELECT p.id FROM products p
    JOIN artisan_shops s ON p.shop_id = s.id
    WHERE s.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view active product variants from active shops"
ON product_variants FOR SELECT
USING (
  status = 'active' AND
  product_id IN (
    SELECT p.id FROM products p
    JOIN artisan_shops s ON p.shop_id = s.id
    WHERE p.active = true AND s.active = true
  )
);

-- Políticas para materials
CREATE POLICY "Users can manage their own materials"
ON materials FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Políticas para bom
CREATE POLICY "Shop owners can manage BOM for their products"
ON bom FOR ALL
USING (
  (product_id IN (
    SELECT p.id FROM products p
    JOIN artisan_shops s ON p.shop_id = s.id
    WHERE s.user_id = auth.uid()
  )) OR
  (variant_id IN (
    SELECT pv.id FROM product_variants pv
    JOIN products p ON pv.product_id = p.id
    JOIN artisan_shops s ON p.shop_id = s.id
    WHERE s.user_id = auth.uid()
  ))
)
WITH CHECK (
  (product_id IN (
    SELECT p.id FROM products p
    JOIN artisan_shops s ON p.shop_id = s.id
    WHERE s.user_id = auth.uid()
  )) OR
  (variant_id IN (
    SELECT pv.id FROM product_variants pv
    JOIN products p ON pv.product_id = p.id
    JOIN artisan_shops s ON p.shop_id = s.id
    WHERE s.user_id = auth.uid()
  ))
);

-- Políticas para inventory_movements
CREATE POLICY "Shop owners can view inventory movements for their products"
ON inventory_movements FOR SELECT
USING (
  product_variant_id IN (
    SELECT pv.id FROM product_variants pv
    JOIN products p ON pv.product_id = p.id
    JOIN artisan_shops s ON p.shop_id = s.id
    WHERE s.user_id = auth.uid()
  )
);

CREATE POLICY "Shop owners can create inventory movements for their products"
ON inventory_movements FOR INSERT
WITH CHECK (
  product_variant_id IN (
    SELECT pv.id FROM product_variants pv
    JOIN products p ON pv.product_id = p.id
    JOIN artisan_shops s ON p.shop_id = s.id
    WHERE s.user_id = auth.uid()
  )
);

-- Comentarios para documentación
COMMENT ON TABLE product_variants IS 'Variantes de productos con SKU, precios, stock y atributos específicos';
COMMENT ON TABLE materials IS 'Materiales usados en la producción de productos artesanales';
COMMENT ON TABLE bom IS 'Bill of Materials - relaciona productos/variantes con materiales necesarios';
COMMENT ON TABLE inventory_movements IS 'Registro de movimientos de inventario (entradas, salidas, ajustes)';

COMMENT ON COLUMN products.made_to_order IS 'Indica si el producto se fabrica bajo pedido (sin stock)';
COMMENT ON COLUMN products.lead_time_days IS 'Días necesarios para fabricar el producto bajo pedido';
COMMENT ON COLUMN products.production_time_hours IS 'Horas de trabajo necesarias para fabricar una unidad';
COMMENT ON COLUMN products.requires_customization IS 'Indica si el producto requiere personalización por cliente';