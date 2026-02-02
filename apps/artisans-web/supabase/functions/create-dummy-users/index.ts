import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DummyUserData {
  email: string;
  password: string;
  fullName: string;
  shopName: string;
  craftType: string;
  region: string;
  category: string;
  materials: string[];
  techniques: string[];
  story: string;
  products: ProductData[];
}

interface ProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  materials: string[];
  techniques: string[];
  images: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar permisos de admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    
    if (!user) {
      throw new Error('No user found');
    }

    // Verificar si es admin
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', user.email)
      .eq('is_active', true)
      .single();

    if (!adminUser) {
      throw new Error('Not authorized - admin only');
    }

    console.log('🎨 Iniciando creación de 10 usuarios dummy...');

    const dummyUsers: DummyUserData[] = [
      {
        email: 'dummy1@telar.app',
        password: 'Dummy123!',
        fullName: 'María Rodríguez',
        shopName: 'Cerámica Luna del Valle',
        craftType: 'ceramics',
        region: 'Valle del Cauca',
        category: 'Cerámica y Alfarería',
        materials: ['Arcilla roja', 'Barro', 'Esmaltes naturales', 'Pigmentos minerales'],
        techniques: ['Alfarería y cerámica', 'Torno de alfarero', 'Esmaltado'],
        story: 'Desde hace tres generaciones, nuestra familia ha trabajado la arcilla del Valle del Cauca. Cada pieza refleja la tradición cerámica vallecaucana, fusionando técnicas ancestrales con diseños contemporáneos. Utilizamos arcillas locales y esmaltes naturales para crear piezas únicas que cuentan historias. Nuestro taller está ubicado en las montañas del Valle, donde la arcilla roja es abundante y de excepcional calidad.',
        products: []
      },
      {
        email: 'dummy2@telar.app',
        password: 'Dummy123!',
        fullName: 'Carlos Jiménez',
        shopName: 'Orfebrería Andina',
        craftType: 'jewelry',
        region: 'Antioquia',
        category: 'Joyería y Bisutería',
        materials: ['Plata 950', 'Oro 18k', 'Piedras semipreciosas', 'Cobre'],
        techniques: ['Joyería', 'Filigrana', 'Fundición en cera perdida'],
        story: 'La orfebrería antioqueña tiene siglos de tradición. En nuestro taller de Medellín, cada joya es creada con técnicas de filigrana heredadas de maestros artesanos. Trabajamos principalmente con plata 950 y oro 18k, combinándolos con piedras semipreciosas colombianas. Cada pieza es única y lleva el sello de la calidad artesanal paisa.',
        products: []
      },
      {
        email: 'dummy3@telar.app',
        password: 'Dummy123!',
        fullName: 'Ana Gutiérrez',
        shopName: 'Telares de los Andes',
        craftType: 'textiles',
        region: 'Boyacá',
        category: 'Textiles y Moda',
        materials: ['Lana de oveja', 'Algodón orgánico', 'Fique', 'Hilos naturales'],
        techniques: ['Tejeduría en telar vertical', 'Telar de pedal', 'Tinturado natural'],
        story: 'En los páramos de Boyacá, tejemos sueños con lana de oveja y algodón orgánico. Nuestro taller familiar preserva las técnicas ancestrales del telar vertical, transmitidas de generación en generación. Cada ruana, bufanda o tapiz refleja los colores de nuestros paisajes andinos, teñidos con plantas y minerales naturales de la región.',
        products: []
      },
      {
        email: 'dummy4@telar.app',
        password: 'Dummy123!',
        fullName: 'Pedro Mosquera',
        shopName: 'Fibras del Pacífico',
        craftType: 'basketry',
        region: 'Chocó',
        category: 'Bolsos y Carteras',
        materials: ['Werregue', 'Iraca', 'Chocolatillo', 'Paja tetera'],
        techniques: ['Cestería', 'Tejeduría en fibras', 'Trenzado'],
        story: 'Desde el Chocó biogeográfico, trabajamos las fibras más nobles del Pacífico colombiano. El werregue, planta sagrada de nuestras comunidades, se convierte en arte en nuestras manos. Cada canasto, sombrero y bolso lleva los patrones ancestrales de nuestra cultura afrocolombiana y los colores vibrantes de la selva tropical.',
        products: []
      },
      {
        email: 'dummy5@telar.app',
        password: 'Dummy123!',
        fullName: 'Jhon Vargas',
        shopName: 'Talla Santandereana',
        craftType: 'woodwork',
        region: 'Santander',
        category: 'Arte y Esculturas',
        materials: ['Cedro', 'Guadua', 'Bambú', 'Pino'],
        techniques: ['Talla en madera', 'Carpintería artesanal', 'Torneado'],
        story: 'En el corazón de Santander, tallamos historias en madera. Nuestro taller especializado en talla artesanal trabaja principalmente con cedro y guadua de la región. Cada escultura, cuchara tallada y pieza decorativa nace del respeto por la madera y la tradición santandereana de la carpintería fina. Combinamos técnicas tradicionales con diseños contemporáneos.',
        products: []
      },
      {
        email: 'dummy6@telar.app',
        password: 'Dummy123!',
        fullName: 'Laura Martínez',
        shopName: 'Marroquinería Bogotana',
        craftType: 'leather',
        region: 'Bogotá',
        category: 'Bolsos y Carteras',
        materials: ['Cuero genuino', 'Piel curtida', 'Hilos encerados', 'Herrajes de bronce'],
        techniques: ['Marroquinería', 'Repujado en cuero', 'Costura artesanal'],
        story: 'La marroquinería bogotana tiene tradición centenaria. En nuestro taller del centro histórico, cada pieza de cuero es cortada, cosida y repujada a mano. Trabajamos con cueros curtidos naturalmente y herrajes de alta calidad. Nuestras carteras, cinturones y morrales combinan funcionalidad con el arte del repujado tradicional colombiano.',
        products: []
      },
      {
        email: 'dummy7@telar.app',
        password: 'Dummy123!',
        fullName: 'Diego Torres',
        shopName: 'Forja del Cauca',
        craftType: 'metalwork',
        region: 'Cauca',
        category: 'Iluminación',
        materials: ['Hierro', 'Cobre', 'Bronce', 'Aluminio'],
        techniques: ['Metalistería', 'Trabajo en hierro', 'Forja artesanal'],
        story: 'El fuego y el martillo son nuestras herramientas. En el Cauca, forjamos el metal para crear piezas funcionales y decorativas. Nuestro taller de herrería artesanal combina técnicas ancestrales de metalistería con diseños modernos. Cada lámpara, candelabro o escultura nace del trabajo arduo del hierro, cobre y bronce.',
        products: []
      },
      {
        email: 'dummy8@telar.app',
        password: 'Dummy123!',
        fullName: 'Sofía Benavides',
        shopName: 'Arte Nariñense',
        craftType: 'painting',
        region: 'Nariño',
        category: 'Decoración del Hogar',
        materials: ['Barniz de Pasto (Mopa mopa)', 'Tintas naturales', 'Madera', 'Oro en hoja'],
        techniques: ['Barniz de Pasto', 'Enchape en Tamo', 'Pintura sobre madera'],
        story: 'El barniz de Pasto es una técnica prehispánica única en el mundo, presente solo en Nariño. En nuestro taller, trabajamos con la resina de mopa mopa, material sagrado que se convierte en arte. Cada caja decorativa, marco o joyero es una obra de arte que preserva esta tradición ancestral declarada Patrimonio Cultural de la Nación.',
        products: []
      },
      {
        email: 'dummy9@telar.app',
        password: 'Dummy123!',
        fullName: 'Camila Ríos',
        shopName: 'Bolsos y Fibras del Eje Cafetero',
        craftType: 'textiles',
        region: 'Caldas',
        category: 'Bolsos y Carteras',
        materials: ['Fique', 'Algodón', 'Cuero', 'Lana'],
        techniques: ['Tejeduría', 'Macramé', 'Cestería', 'Combinación de materiales'],
        story: 'En el corazón del Eje Cafetero, tejemos bolsos que combinan tradición y modernidad. Utilizamos fique cultivado localmente, algodón orgánico y detalles en cuero para crear piezas versátiles y resistentes. Cada bolso cuenta la historia del café colombiano y la calidez de nuestra región. Técnicas de macramé y tejeduría se fusionan en diseños únicos.',
        products: []
      },
      {
        email: 'dummy10@telar.app',
        password: 'Dummy123!',
        fullName: 'Andrés Salazar',
        shopName: 'Decoración Artesanal del Quindío',
        craftType: 'sculpture',
        region: 'Quindío',
        category: 'Decoración del Hogar',
        materials: ['Madera', 'Cerámica', 'Vidrio', 'Metal', 'Fibras naturales'],
        techniques: ['Talla en madera', 'Cerámica', 'Vidrio soplado', 'Forja', 'Mixta'],
        story: 'Desde el paisaje cultural cafetero, creamos piezas decorativas que embellecen cualquier espacio. Nuestro taller multidisciplinario combina madera, cerámica, vidrio y metal para crear jarrones, espejos, portavelas y esculturas únicas. Cada pieza refleja la biodiversidad y calidez del Quindío, fusionando técnicas artesanales con diseño contemporáneo.',
        products: []
      }
    ];

    // Generar productos para cada usuario
    const productTemplates = {
      'Cerámica y Alfarería': [
        { name: 'Vajilla Completa Artesanal', desc: 'Set de 12 piezas en cerámica de alta temperatura con esmaltes naturales', price: 380000 },
        { name: 'Tazas Esmaltadas a Mano', desc: 'Par de tazas únicas con diseños originales y esmalte brillante', price: 65000 },
        { name: 'Jarrón Decorativo Grande', desc: 'Pieza escultural en barro cocido con acabado rústico elegante', price: 195000 },
        { name: 'Platos Decorativos de Pared', desc: 'Set de 3 platos con motivos tradicionales vallecaucanos', price: 140000 },
        { name: 'Esculturas Pequeñas en Cerámica', desc: 'Figuras decorativas inspiradas en la fauna local', price: 85000 },
        { name: 'Bowls para Servir', desc: 'Set de 4 bowls en diferentes tamaños con esmalte mate', price: 120000 },
        { name: 'Juego de Té Ceremonial', desc: 'Tetera y 4 tazas con diseño minimalista japonés', price: 280000 },
        { name: 'Macetas Artesanales', desc: 'Set de 3 macetas con platillo incluido, perfectas para suculentas', price: 95000 },
        { name: 'Bandeja de Cerámica', desc: 'Bandeja rectangular con asas, ideal para servir', price: 110000 },
        { name: 'Incensario Decorativo', desc: 'Pieza funcional con diseño tradicional', price: 55000 }
      ],
      'Joyería y Bisutería': [
        { name: 'Aretes de Filigrana en Plata', desc: 'Elaborados con técnica tradicional antioqueña en plata 950', price: 180000 },
        { name: 'Collar con Esmeraldas', desc: 'Diseño contemporáneo con esmeraldas colombianas engastadas', price: 450000 },
        { name: 'Anillo de Compromiso Artesanal', desc: 'Oro 18k con diseño único tallado a mano', price: 1200000 },
        { name: 'Pulsera en Plata y Cobre', desc: 'Diseño moderno con combinación de metales', price: 220000 },
        { name: 'Dijes Inspirados en la Naturaleza', desc: 'Set de 3 dijes en plata con piedras semipreciosas', price: 150000 },
        { name: 'Brazalete de Cobre Martillado', desc: 'Pieza statement con acabado oxidado artístico', price: 95000 },
        { name: 'Aretes Largos con Amatista', desc: 'Elegantes aretes con piedras naturales moradas', price: 280000 },
        { name: 'Tobillera en Plata', desc: 'Diseño delicado con dijes colgantes', price: 160000 },
        { name: 'Gargantilla Contemporánea', desc: 'Collar corto en oro rosado con detalle central', price: 890000 },
        { name: 'Set de Anillos Apilables', desc: '5 anillos delgados en plata para combinar', price: 195000 }
      ],
      'Textiles y Moda': [
        { name: 'Ruana de Lana Virgen', desc: 'Tejida a mano en telar vertical con lana natural de oveja', price: 320000 },
        { name: 'Bufanda de Alpaca', desc: 'Suave y abrigadora con diseño de grecas andinas', price: 85000 },
        { name: 'Cojines Decorativos Tejidos', desc: 'Set de 2 cojines con relleno, tejidos en telar', price: 140000 },
        { name: 'Tapiz de Pared Grande', desc: 'Pieza artística tejida con motivos geométricos', price: 480000 },
        { name: 'Manta para Sofá', desc: 'Manta gruesa en lana con flecos, perfecta para el frío', price: 260000 },
        { name: 'Poncho Unisex', desc: 'Diseño versátil en algodón orgánico con capucha', price: 195000 },
        { name: 'Camino de Mesa Tejido', desc: 'Elegante camino con bordes en flecos naturales', price: 110000 },
        { name: 'Chaleco Artesanal', desc: 'Chaleco sin mangas en lana con botones de madera', price: 230000 },
        { name: 'Gorro y Guantes Set', desc: 'Conjunto abrigador tejido en lana merino', price: 75000 },
        { name: 'Alfombra Pequeña Tejida', desc: 'Alfombra decorativa 60x90cm con diseño tradicional', price: 340000 }
      ],
      'Bolsos y Carteras': [
        { name: 'Bolso Grande de Werregue', desc: 'Tejido a mano por artesanas del Pacífico con patrones ancestrales', price: 420000 },
        { name: 'Mochila de Iraca', desc: 'Resistente y espaciosa, perfecta para el día a día', price: 165000 },
        { name: 'Morral Wayuu Auténtico', desc: 'Tejido por comunidad indígena con diseños únicos', price: 280000 },
        { name: 'Clutch para Ocasiones Especiales', desc: 'Elegante bolso de mano con cierre magnético', price: 95000 },
        { name: 'Tote Bag en Fique', desc: 'Bolso grande de mercado con asas reforzadas', price: 75000 },
        { name: 'Cartera de Mano Tejida', desc: 'Ideal para uso diario con compartimentos internos', price: 120000 },
        { name: 'Bolso Bandolera', desc: 'Con correa ajustable en cuero y cuerpo tejido', price: 195000 },
        { name: 'Monedero Pequeño', desc: 'Compacto y colorido con cierre de cremallera', price: 35000 },
        { name: 'Mochila para Laptop', desc: 'Funcional con compartimento acolchado para portátil', price: 310000 },
        { name: 'Bolso de Playa Grande', desc: 'Espacioso y resistente al agua con forro interno', price: 145000 }
      ],
      'Arte y Esculturas': [
        { name: 'Escultura en Cedro Tallado', desc: 'Pieza única inspirada en aves andinas, altura 40cm', price: 580000 },
        { name: 'Cucharas de Madera Set', desc: 'Set de 5 cucharas talladas para cocina gourmet', price: 85000 },
        { name: 'Tabla para Cortar Premium', desc: 'Tabla grande en guadua con acabado alimenticio', price: 120000 },
        { name: 'Caja Decorativa Tallada', desc: 'Con tapa y detalles florales en relieve', price: 165000 },
        { name: 'Máscara Ceremonial', desc: 'Inspirada en tradiciones indígenas colombianas', price: 340000 },
        { name: 'Juego de Utensilios de Cocina', desc: '8 piezas en madera para cocinar', price: 145000 },
        { name: 'Escultura Abstracta Moderna', desc: 'Pieza contemporánea en madera de pino', price: 420000 },
        { name: 'Portarretratos Tallados', desc: 'Set de 3 marcos con diseños geométricos', price: 95000 },
        { name: 'Figura Decorativa de Guadua', desc: 'Escultura minimalista con soporte incluido', price: 155000 },
        { name: 'Reloj de Pared en Madera', desc: 'Funcional y decorativo con números romanos', price: 185000 }
      ],
      'Iluminación': [
        { name: 'Lámpara de Techo Industrial', desc: 'Pantalla de hierro forjado con acabado óxido', price: 380000 },
        { name: 'Candelabro de Mesa en Cobre', desc: 'Para 5 velas, diseño barroco moderno', price: 220000 },
        { name: 'Aplique de Pared', desc: 'Iluminación ambiental en bronce envejecido', price: 195000 },
        { name: 'Lámpara de Pie Artesanal', desc: 'Base en hierro forjado con pantalla de tela', price: 580000 },
        { name: 'Farol Exterior', desc: 'Resistente a la intemperie con vidrio biselado', price: 340000 },
        { name: 'Lámpara Colgante Moderna', desc: 'Diseño geométrico en cobre martillado', price: 420000 },
        { name: 'Candelabro de Pared', desc: 'Para 3 velas, montaje en pared', price: 165000 },
        { name: 'Lámpara de Mesa Vintage', desc: 'Acabado en bronce con interruptor de cadena', price: 285000 },
        { name: 'Set de Portavelas', desc: '5 portavelas de diferentes alturas', price: 145000 },
        { name: 'Araña de Cristal y Metal', desc: 'Lámpara de techo con 8 brazos', price: 1250000 }
      ],
      'Decoración del Hogar': [
        { name: 'Caja Decorativa Barniz de Pasto', desc: 'Técnica ancestral nariñense con incrustaciones de mopa mopa', price: 280000 },
        { name: 'Marco para Foto Grande', desc: 'Enchape en tamo con detalles en oro', price: 185000 },
        { name: 'Cuadro Pintado a Mano', desc: 'Paisaje cafetero sobre madera, técnica mixta', price: 420000 },
        { name: 'Joyero con Compartimentos', desc: 'Barniz de Pasto con interior en terciopelo', price: 195000 },
        { name: 'Espejo Decorativo Redondo', desc: 'Marco en madera con detalles en oro en hoja', price: 340000 },
        { name: 'Set de Cajas Anidadas', desc: '3 cajas decorativas de diferentes tamaños', price: 165000 },
        { name: 'Bandeja Ceremonial', desc: 'Para servir con asas de metal', price: 145000 },
        { name: 'Relicario de Pared', desc: 'Pieza decorativa con puerta de vidrio', price: 225000 },
        { name: 'Cofre de Tesoro', desc: 'Con cerradura decorativa y llave', price: 380000 },
        { name: 'Porta Joyas Pequeño', desc: 'Compacto con espejo interno', price: 95000 }
      ]
    };

    // Función para obtener URL de imagen placeholder de Unsplash
    const getPlaceholderImage = (category: string, index: number): string => {
      const queries: Record<string, string> = {
        'Cerámica y Alfarería': 'ceramic-pottery-handmade',
        'Joyería y Bisutería': 'handmade-jewelry-silver',
        'Textiles y Moda': 'woven-textile-wool',
        'Bolsos y Carteras': 'handwoven-basket-bag',
        'Arte y Esculturas': 'wood-carving-sculpture',
        'Iluminación': 'artisan-lamp-metal',
        'Decoración del Hogar': 'artisan-home-decor'
      };
      
      const query = queries[category] || 'artisan-craft';
      return `https://source.unsplash.com/800x800/?${query}&sig=${index}`;
    };

    // Asignar productos a cada usuario
    dummyUsers.forEach((user, userIndex) => {
      const templates = productTemplates[user.category];
      user.products = templates.map((template, productIndex) => ({
        name: template.name,
        description: `${template.desc}. Elaborado artesanalmente en ${user.region} utilizando ${user.materials[0]} de la más alta calidad. Cada pieza es única y refleja la tradición artesanal colombiana. Medidas aproximadas y características específicas disponibles bajo pedido.`,
        price: template.price,
        category: user.category,
        materials: user.materials,
        techniques: user.techniques,
        images: [
          getPlaceholderImage(user.category, userIndex * 10 + productIndex),
          getPlaceholderImage(user.category, userIndex * 10 + productIndex + 100),
          getPlaceholderImage(user.category, userIndex * 10 + productIndex + 200)
        ]
      }));
    });

    const results = [];

    // Crear usuarios
    for (const userData of dummyUsers) {
      try {
        console.log(`\n👤 Creando usuario: ${userData.email}...`);

        // 1. Crear auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
        });

        if (authError) throw authError;
        const userId = authData.user.id;

        // 2. Crear perfil
        const { error: profileError } = await supabaseAdmin.from('user_profiles').insert({
          user_id: userId,
          full_name: userData.fullName,
          user_type: 'artisan'
        });

        if (profileError) throw profileError;

        // 3. Crear tienda
        const slug = userData.shopName.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        const shopData = {
          user_id: userId,
          shop_name: userData.shopName,
          shop_slug: slug,
          craft_type: userData.craftType,
          region: userData.region,
          description: `Tienda artesanal especializada en ${userData.category} ubicada en ${userData.region}. Trabajamos con ${userData.materials.join(', ')} y técnicas tradicionales como ${userData.techniques.join(', ')}.`,
          story: userData.story,
          active: true,
          featured: Math.random() > 0.5,
          logo_url: getPlaceholderImage(userData.category, dummyUsers.indexOf(userData) * 1000),
          banner_url: getPlaceholderImage(userData.category, dummyUsers.indexOf(userData) * 1000 + 1),
          contact_info: {
            email: userData.email,
            phone: '+57 300 123 4567',
            whatsapp: '+57 300 123 4567',
            instagram: `@${slug}`,
            facebook: slug
          },
          social_links: {
            instagram: `https://instagram.com/${slug}`,
            facebook: `https://facebook.com/${slug}`
          },
          hero_config: {
            slides: [
              {
                image: getPlaceholderImage(userData.category, dummyUsers.indexOf(userData) * 1000 + 2),
                title: `Artesanía Auténtica de ${userData.region}`,
                subtitle: `Descubre piezas únicas en ${userData.category}`,
                ctaText: 'Ver Productos',
                ctaLink: '#productos'
              },
              {
                image: getPlaceholderImage(userData.category, dummyUsers.indexOf(userData) * 1000 + 3),
                title: `Tradición y Calidad`,
                subtitle: `Trabajamos con ${userData.materials[0]}`,
                ctaText: 'Conocer Más',
                ctaLink: '#sobre-nosotros'
              },
              {
                image: getPlaceholderImage(userData.category, dummyUsers.indexOf(userData) * 1000 + 4),
                title: `Hecho a Mano`,
                subtitle: `Cada pieza cuenta una historia`,
                ctaText: 'Contáctanos',
                ctaLink: '#contacto'
              }
            ]
          },
          seo_data: {
            title: `${userData.shopName} - ${userData.category} Artesanal`,
            description: userData.story.substring(0, 160),
            keywords: [...userData.materials, ...userData.techniques, userData.region, userData.category]
          }
        };

        const { data: shopResult, error: shopError } = await supabaseAdmin
          .from('artisan_shops')
          .insert(shopData)
          .select()
          .single();

        if (shopError) throw shopError;

        console.log(`✅ Tienda creada: ${userData.shopName}`);

        // 4. Crear productos
        console.log(`📦 Creando 10 productos para ${userData.shopName}...`);
        
        for (const product of userData.products) {
          const { error: productError } = await supabaseAdmin.from('products').insert({
            shop_id: shopResult.id,
            name: product.name,
            description: product.description,
            short_description: product.description.substring(0, 150) + '...',
            price: product.price,
            category: product.category,
            materials: product.materials,
            techniques: product.techniques,
            images: product.images,
            active: true,
            featured: Math.random() > 0.7,
            inventory: Math.floor(Math.random() * 20) + 5,
            sku: `SKU-${userId.substring(0, 8)}-${Math.random().toString(36).substring(7)}`.toUpperCase(),
            tags: [...product.materials, ...product.techniques, userData.region],
            dimensions: {
              length: Math.floor(Math.random() * 30) + 10,
              width: Math.floor(Math.random() * 30) + 10,
              height: Math.floor(Math.random() * 20) + 5,
              unit: 'cm'
            },
            weight: Math.floor(Math.random() * 500) + 100,
            production_time: '5-7 días',
            production_time_hours: Math.floor(Math.random() * 40) + 8,
            customizable: Math.random() > 0.6,
            made_to_order: Math.random() > 0.5,
            seo_data: {
              title: `${product.name} - ${userData.shopName}`,
              description: product.description,
              keywords: [...product.materials, ...product.techniques, product.category]
            }
          });

          if (productError) {
            console.error(`Error creating product ${product.name}:`, productError);
          }
        }

        // 5. Crear datos de madurez
        await supabaseAdmin.from('user_maturity_scores').insert({
          user_id: userId,
          idea_validation: Math.floor(Math.random() * 30) + 40,
          user_experience: Math.floor(Math.random() * 30) + 40,
          market_fit: Math.floor(Math.random() * 30) + 40,
          monetization: Math.floor(Math.random() * 30) + 40
        });

        // 6. Crear tareas iniciales
        const tasks = [
          {
            user_id: userId,
            agent_id: 'shop-creator',
            title: 'Optimizar fotos de productos',
            description: 'Revisa y mejora las fotos de tus productos para aumentar ventas',
            status: 'pending',
            priority: 3,
            environment: 'growth'
          },
          {
            user_id: userId,
            agent_id: 'marketing',
            title: 'Crear campaña en redes sociales',
            description: 'Planifica contenido para Instagram y Facebook',
            status: 'pending',
            priority: 2,
            environment: 'growth'
          },
          {
            user_id: userId,
            agent_id: 'business',
            title: 'Analizar precios de mercado',
            description: 'Compara tus precios con la competencia',
            status: 'pending',
            priority: 2,
            environment: 'growth'
          }
        ];

        await supabaseAdmin.from('agent_tasks').insert(tasks);

        results.push({
          email: userData.email,
          shopName: userData.shopName,
          productsCreated: userData.products.length,
          success: true
        });

        console.log(`✅ Usuario ${userData.email} completado exitosamente\n`);

      } catch (error) {
        console.error(`❌ Error creando usuario ${userData.email}:`, error);
        results.push({
          email: userData.email,
          success: false,
          error: error.message
        });
      }
    }

    console.log('\n🎉 Proceso completado!');
    console.log(`✅ Usuarios creados exitosamente: ${results.filter(r => r.success).length}/10`);
    console.log(`❌ Errores: ${results.filter(r => !r.success).length}`);

    return new Response(JSON.stringify({
      success: true,
      results,
      summary: {
        totalUsers: dummyUsers.length,
        successfulUsers: results.filter(r => r.success).length,
        totalProducts: results.filter(r => r.success).reduce((acc, r) => acc + (r.productsCreated || 0), 0),
        credentials: dummyUsers.map(u => ({ email: u.email, password: u.password }))
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error en create-dummy-users:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
