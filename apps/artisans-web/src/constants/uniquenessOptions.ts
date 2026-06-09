export type UniquenessKey =
  | 'tecnica_unica'
  | 'diseno_propio'
  | 'materiales_especiales'
  | 'raiz_cultural'
  | 'precio_justo'
  | 'aun_no_lo_se';

export const UNIQUENESS_OPTIONS: { key: UniquenessKey; label: string }[] = [
  { key: 'tecnica_unica',         label: 'Técnica única' },
  { key: 'diseno_propio',         label: 'Diseño propio' },
  { key: 'materiales_especiales', label: 'Materiales especiales' },
  { key: 'raiz_cultural',         label: 'Raíz cultural' },
  { key: 'precio_justo',          label: 'Precio justo' },
  { key: 'aun_no_lo_se',          label: 'Aún no lo sé' },
];

export const UNIQUENESS_STORED_LABELS: Record<UniquenessKey, string> = {
  tecnica_unica:         'Técnica o tradición (cómo lo hago)',
  diseno_propio:         'Diseño o creatividad propia (qué hago)',
  materiales_especiales: 'Materiales únicos o sostenibles',
  raiz_cultural:         'Historia, cultura o territorio',
  precio_justo:          'Precio accesible',
  aun_no_lo_se:          'No lo tengo claro',
};

export function buildNarrativeKey(keys: UniquenessKey[]): string {
  return [...keys].sort().join('|');
}

export function getNarrative(keys: UniquenessKey[]): string {
  if (keys.length === 0) return '';
  return UNIQUENESS_NARRATIVES[buildNarrativeKey(keys)] ?? '';
}

export const UNIQUENESS_NARRATIVES: Record<string, string> = {
  // Exclusiva
  'aun_no_lo_se':
    'Todavía estoy descubriendo qué hace único mi trabajo. Cada pieza que creo forma parte de un proceso de aprendizaje, exploración y búsqueda de una identidad propia. Estoy construyendo mi camino artesanal paso a paso, permitiéndome experimentar, aprender y encontrar aquello que realmente me representa.',

  // Individuales
  'tecnica_unica':
    'Mi trabajo se distingue por una técnica que he desarrollado y perfeccionado con el tiempo. Cada pieza refleja conocimientos, prácticas y formas de hacer que requieren dedicación, paciencia y experiencia para alcanzar el resultado que busco.',

  'diseno_propio':
    'Cada una de mis piezas nace de ideas y diseños creados desde mi propia visión. Me gusta desarrollar propuestas originales que expresen mi manera de entender el oficio y de conectar la creatividad con el trabajo hecho a mano.',

  'materiales_especiales':
    'Los materiales que utilizo son una parte fundamental de lo que hago. Dedico tiempo a seleccionar cuidadosamente cada elemento porque creo que la calidad, la procedencia y las características de los materiales influyen profundamente en el resultado final.',

  'raiz_cultural':
    'Mi trabajo está inspirado en las tradiciones, conocimientos y expresiones culturales que hacen parte de mi historia y de mi territorio. A través de cada pieza busco mantener vivas esas raíces y compartirlas con quienes valoran su significado.',

  'precio_justo':
    'Creo en una artesanía donde el valor del trabajo, el tiempo invertido y el conocimiento detrás de cada pieza sean reconocidos de manera justa. Mi propósito es ofrecer productos honestos que beneficien tanto a quien los crea como a quien los adquiere.',

  // Combinaciones de 2
  'diseno_propio|tecnica_unica':
    'Mi trabajo combina una técnica cuidadosamente desarrollada con diseños creados desde mi propia visión. Cada pieza refleja tanto la experiencia adquirida en el oficio como la búsqueda constante de una identidad creativa propia.',

  'materiales_especiales|tecnica_unica':
    'La combinación entre una técnica especializada y una selección cuidadosa de materiales es lo que da carácter a mi trabajo. Ambos elementos se complementan para crear piezas donde cada detalle tiene una razón de ser.',

  'raiz_cultural|tecnica_unica':
    'Mi trabajo une conocimientos técnicos construidos con la práctica y una profunda conexión con mis raíces culturales. Cada pieza busca preservar saberes tradicionales mientras expresa la identidad de mi comunidad y mi historia.',

  'precio_justo|tecnica_unica':
    'Creo que una técnica desarrollada con dedicación merece ser valorada justamente. Mi trabajo busca equilibrar la calidad, el conocimiento artesanal y un precio honesto que reconozca el esfuerzo que hay detrás de cada pieza.',

  'diseno_propio|materiales_especiales':
    'Mis piezas nacen de diseños originales que toman forma a través de materiales cuidadosamente seleccionados. La creatividad y la elección consciente de cada material son parte esencial de la identidad de mi trabajo.',

  'diseno_propio|raiz_cultural':
    'Mi trabajo combina una visión creativa personal con elementos inspirados en mi herencia cultural. Cada pieza busca expresar algo nuevo sin perder el vínculo con las historias y tradiciones que me han acompañado.',

  'diseno_propio|precio_justo':
    'Creo en crear piezas originales y auténticas que puedan llegar a las personas a través de una relación justa y transparente. Mi trabajo busca equilibrar creatividad, calidad y accesibilidad.',

  'materiales_especiales|raiz_cultural':
    'Los materiales que utilizo y las tradiciones que inspiran mi trabajo tienen un profundo significado para mí. Cada pieza nace del encuentro entre los recursos que selecciono cuidadosamente y las historias que deseo preservar.',

  'materiales_especiales|precio_justo':
    'Selecciono materiales con atención y respeto por su calidad, procurando al mismo tiempo mantener una propuesta honesta y equilibrada. Creo que es posible ofrecer piezas bien hechas sin perder de vista el valor justo para todas las personas involucradas.',

  'precio_justo|raiz_cultural':
    'Mi trabajo honra tradiciones y conocimientos heredados mientras promueve una relación más justa entre quienes crean y quienes compran. Cada pieza busca generar valor cultural y humano al mismo tiempo.',

  // Combinaciones de 3
  'diseno_propio|materiales_especiales|tecnica_unica':
    'Mi trabajo une una técnica desarrollada con dedicación, diseños propios y materiales cuidadosamente seleccionados. Cada pieza refleja una búsqueda constante por crear objetos con identidad, calidad y significado.',

  'diseno_propio|raiz_cultural|tecnica_unica':
    'Cada pieza que realizo nace de la unión entre mi experiencia técnica, mi creatividad y las raíces culturales que inspiran mi trabajo. Es una forma de expresar quién soy mientras mantengo vivo el valor de las tradiciones que me acompañan.',

  'diseno_propio|precio_justo|tecnica_unica':
    'Mi trabajo combina conocimiento artesanal, diseño propio y una visión de comercio justo. Busco crear piezas auténticas que reflejen dedicación, creatividad y respeto por el valor real del trabajo hecho a mano.',

  'materiales_especiales|raiz_cultural|tecnica_unica':
    'La técnica que utilizo, los materiales que selecciono y las tradiciones que inspiran mi trabajo se unen para dar vida a piezas que cuentan historias. Cada creación refleja una conexión profunda entre conocimiento, territorio y oficio.',

  'materiales_especiales|precio_justo|tecnica_unica':
    'Creo en una artesanía donde la calidad nace tanto del conocimiento técnico como de los materiales utilizados. Mi compromiso es ofrecer piezas elaboradas con cuidado y valoradas de manera justa.',

  'precio_justo|raiz_cultural|tecnica_unica':
    'Mi trabajo busca preservar conocimientos y tradiciones a través de una práctica artesanal desarrollada con dedicación. Al mismo tiempo, promuevo una relación justa que reconozca el valor cultural y humano de cada pieza.',

  'diseno_propio|materiales_especiales|raiz_cultural':
    'Mis piezas surgen de una combinación entre creatividad personal, materiales cuidadosamente elegidos y una profunda inspiración en mis raíces culturales. Cada creación refleja una identidad construida entre tradición e innovación.',

  'diseno_propio|materiales_especiales|precio_justo':
    'Busco crear piezas originales utilizando materiales seleccionados con atención y manteniendo una relación justa con quienes valoran mi trabajo. Para mí, la creatividad también implica responsabilidad y transparencia.',

  'diseno_propio|precio_justo|raiz_cultural':
    'Mi trabajo expresa una visión personal inspirada en la riqueza cultural de mi territorio. Cada pieza busca generar valor a través del diseño, el significado y una relación justa con quienes la adquieren.',

  'materiales_especiales|precio_justo|raiz_cultural':
    'Los materiales que utilizo, las tradiciones que inspiran mi trabajo y mi compromiso con una artesanía justa son pilares fundamentales de lo que hago. Cada pieza busca transmitir autenticidad, respeto y conexión con su origen.',
};
