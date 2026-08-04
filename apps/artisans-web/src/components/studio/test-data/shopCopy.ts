/**
 * Copy de relleno para tiendas (inyector del Store Studio).
 *
 * Misma regla de redacción que catalog.ts: nada concuerda en género ni número con
 * la pieza y se usan verbos impersonales, porque el mismo texto sirve para
 * cualquier oficio. Las plantillas aceptan {taller} {oficio} {lugar} {categoria}.
 */

export interface ShopCopyVars {
  taller: string;
  oficio: string;
  lugar: string;
  categoria: string;
}

export const fillShopCopy = (template: string, vars: ShopCopyVars): string =>
  template
    .replace(/\{taller\}/g, vars.taller)
    .replace(/\{oficio\}/g, vars.oficio)
    .replace(/\{lugar\}/g, vars.lugar)
    .replace(/\{categoria\}/g, vars.categoria);

/** Textos de tienda (tabla `shop.artisan_shops` + aboutContent / políticas). */
export const SHOP_COPY = {
  description:
    'Taller artesanal de {lugar} dedicado al oficio de {oficio}. Cada pieza se hace a mano, en lotes pequeños y con materiales de la región.',
  story:
    '{taller} nació en {lugar} alrededor del oficio de {oficio}. El taller trabaja con tiempos propios del trabajo manual: se alistan los materiales, se elabora pieza por pieza y se revisa el acabado antes de que salga. Lo que sostiene el proyecto es la transmisión del saber — quien aprende hoy enseña mañana — y la relación directa con quien compra.',
  brandClaim: 'Hecho a mano en {lugar}',

  aboutTitle: 'La historia del taller',
  aboutStory:
    'En {taller} el oficio de {oficio} se practica como se aprendió: sin prisa y con las manos. El taller queda en {lugar} y trabaja con materiales que se consiguen cerca, para que cada pieza mantenga la huella del territorio.',
  aboutMission:
    'Llevar el trabajo artesanal de {lugar} a más hogares, con piezas honestas, bien hechas y con precio justo para quien las elabora.',
  aboutVision:
    'Ser un taller reconocido por la calidad de su {oficio} y por sostener el oficio para las siguientes generaciones.',
  aboutValues: [
    { name: 'Trabajo hecho a mano', description: 'Ninguna pieza sale de una máquina: todas pasan por las manos del taller.' },
    { name: 'Materiales de la región', description: 'Se compra cerca y se trabaja con lo que da el territorio.' },
    { name: 'Precio justo', description: 'El valor de la pieza reconoce el tiempo real de elaboración.' },
    { name: 'Saber que se transmite', description: 'El oficio se enseña dentro del taller y en la comunidad.' },
  ],

  hours: 'Lunes a viernes, 8:00 a.m. – 5:00 p.m. Visitas al taller con cita previa.',
  address: 'Taller en {lugar} — atención con cita previa.',
  returnPolicy:
    'Aceptamos devoluciones dentro de los 5 días hábiles siguientes a la entrega, siempre que la pieza esté sin uso y en su empaque original. Al ser piezas hechas a mano, pueden existir variaciones de color y textura entre unidades: eso no se considera un defecto. Si la pieza llega averiada, escríbenos con fotos y la reponemos o devolvemos el dinero.',
  faq: [
    {
      q: '¿Cuánto tarda el envío?',
      a: 'Entre 3 y 8 días hábiles según la ciudad. Si la pieza es por encargo, el tiempo de elaboración se suma y te lo confirmamos al comprar.',
    },
    {
      q: '¿Las piezas son todas iguales?',
      a: 'No. Al hacerse a mano hay pequeñas diferencias de color, textura y medida entre unidades; es parte del trabajo artesanal.',
    },
    {
      q: '¿Hacen piezas a la medida?',
      a: 'Sí. Escríbenos con la idea, las medidas y la fecha en que la necesitas y te confirmamos si el taller puede hacerla.',
    },
  ],

  certifications: ['Hecho a mano', 'Origen trazable'],
} as const;

/** Perfil artesanal (jsonb `artisanProfile`, pasos del ArtisanProfileWizard). */
export const PROFILE_COPY = {
  shortBio:
    'Artesano de {lugar} dedicado al oficio de {oficio}. Trabaja en su taller con materiales de la región y produce en lotes pequeños.',
  learnedFrom: 'family',
  learnedFromDetail:
    'Aprendió el oficio en casa, viendo trabajar a su familia, y luego lo fue afinando con la práctica diaria en el taller.',
  startAge: 14,
  culturalMeaning:
    'En {lugar} el oficio de {oficio} hace parte de la vida cotidiana: acompaña las casas, las celebraciones y el trabajo del campo. Mantenerlo vivo es mantener viva una forma de entender el territorio.',
  motivation:
    'Seguir viviendo del oficio y que el trabajo hecho a mano llegue a personas que valoren el tiempo que lleva hacerlo.',
  craftMessage:
    'Una pieza hecha a mano guarda el tiempo de quien la hizo. Eso es lo que se lleva quien la compra.',
  regionalHistory:
    'El oficio de {oficio} tiene presencia en {lugar} desde hace generaciones, con materiales y formas propias de la zona.',
  productDescription:
    'El taller trabaja piezas de {categoria}: producción en lotes pequeños, con acabados revisados uno a uno y posibilidad de encargos a la medida.',
  workshopDescription:
    'Taller familiar en {lugar}, con espacio de trabajo, zona de secado y almacenamiento de materiales. Allí se completa todo el proceso, desde el alistamiento hasta el empaque.',
  creationProcess:
    'Se seleccionan y alistan los materiales, se elabora la pieza a mano, se deja secar o curar el tiempo necesario y se revisan los acabados antes de empacar.',
  uniqueness:
    'Lo que distingue al taller es la combinación de una técnica aprendida en casa con materiales de {lugar} y acabados revisados pieza por pieza.',
  craftStyle: ['Tradicional', 'Funcional'],
  communityVillage: '',
  ethnicRelation: 'ninguna',
} as const;
