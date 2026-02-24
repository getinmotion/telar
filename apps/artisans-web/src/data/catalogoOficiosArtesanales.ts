/**
 * Catálogo Oficial de Oficios y Técnicas Artesanales de Colombia
 * Fuente: Ministerio de Cultura / AdeC
 * Versión: 2024
 * 
 * Este es el catálogo oficial para clasificar artesanos colombianos
 * con códigos CUOC (Clasificación Única de Ocupaciones de Colombia)
 * y códigos AdeC (Artesanías de Colombia)
 */

export interface TecnicaArtesanal {
  codigoTecnicaAdeC: string;
  nombreTecnica: string;
  definicionTecnica: string;
}

export interface OficioArtesanal {
  codigoMateriaPrimaCUOC: string;
  codigoMateriaPrimaAdeC: string;
  materiaPrima: string;
  codigoOficioCUOC: string;
  codigoOficioAdeC: string;
  tipoMateriaPrima: string;
  oficio: string;
  definicionOficio: string;
  tecnicas: TecnicaArtesanal[];
}

export const catalogoOficialArtesanias: OficioArtesanal[] = [
  // MADERA
  {
    codigoMateriaPrimaCUOC: "735",
    codigoMateriaPrimaAdeC: "735",
    materiaPrima: "Madera",
    codigoOficioCUOC: "7351 7352 7522",
    codigoOficioAdeC: "7351-1",
    tipoMateriaPrima: "",
    oficio: "Trabajos en madera, carpintería y ebanistería",
    definicionOficio: "Consiste en la transformación de la madera mediante la aplicación y utilización de diferentes procesos y herramientas manuales y eléctricas cuyo objetivo es resaltar las características y propiedades del material al convertirlo en objetos utilitarios o decorativos.",
    tecnicas: [
      {
        codigoTecnicaAdeC: "7351-11",
        nombreTecnica: "Talla",
        definicionTecnica: "Técnica que mediante el desbaste retira partes del material para lograr formas, volúmenes y superficies con alto y bajo relieve."
      },
      {
        codigoTecnicaAdeC: "7351-12",
        nombreTecnica: "Taracea",
        definicionTecnica: "Técnica que incrusta hueso, cacho, madera u otro material en de la superficie de madera."
      },
      {
        codigoTecnicaAdeC: "7351-13",
        nombreTecnica: "Torneado",
        definicionTecnica: "Técnica para obtener piezas cilíndricas, o redondeadas con el uso del torno."
      },
      {
        codigoTecnicaAdeC: "7351-14",
        nombreTecnica: "Calado",
        definicionTecnica: "Técnica que mediante cortes se atraviesa la superficie logrando vacíos."
      },
      {
        codigoTecnicaAdeC: "7351-15",
        nombreTecnica: "Curvado",
        definicionTecnica: "Técnica que consiste en arquear la materia prima"
      },
      {
        codigoTecnicaAdeC: "7351-16",
        nombreTecnica: "Labrado",
        definicionTecnica: "Técnica que mediante la incisión superficial del material logra texturas."
      },
      {
        codigoTecnicaAdeC: "7351-17",
        nombreTecnica: "Ensamble",
        definicionTecnica: "Técnica que consite en unir secciones de madera sin necesidad de usar tornillos ni clavos."
      }
    ]
  },

  // GUADUA, BAMBÚ
  {
    codigoMateriaPrimaCUOC: "739",
    codigoMateriaPrimaAdeC: "739-6",
    materiaPrima: "Guadua, Bambú, Chonta, Corozo",
    codigoOficioCUOC: "7351",
    codigoOficioAdeC: "7399-1",
    tipoMateriaPrima: "",
    oficio: "Trabajos en Guadua, Bambú, Chonta, Corozo",
    definicionOficio: "Especialidad de trabajo que se basa en la transformación de materiales no maderables y se centra en el desarrollo de estructuras, mobiliario o productos para el hogar, empleando especies vegetales que pertenecen a la familia de las gramíneas de tallo leñoso y palmaceas.",
    tecnicas: [
      {
        codigoTecnicaAdeC: "7399-11",
        nombreTecnica: "Torneado",
        definicionTecnica: "Técnica para obtener piezas cilíndricas, o redondeadas con el uso del torno."
      },
      {
        codigoTecnicaAdeC: "7399-12",
        nombreTecnica: "Labrado",
        definicionTecnica: "Técnica que mediante la incisión superficial del material logra texturas."
      },
      {
        codigoTecnicaAdeC: "7399-13",
        nombreTecnica: "Ensamble",
        definicionTecnica: "Técnica que consite en unir secciones de de la materia prima sin necesidad de usar tornillos ni clavos."
      },
      {
        codigoTecnicaAdeC: "7399-14",
        nombreTecnica: "Laminado",
        definicionTecnica: "Técnica que consiste en la obtención de tablillas delgadas y pulidas."
      },
      {
        codigoTecnicaAdeC: "7399-15",
        nombreTecnica: "Calado",
        definicionTecnica: "Técnica que mediante cortes se atraviesa la superficie logrando vacíos."
      },
      {
        codigoTecnicaAdeC: "7399-16",
        nombreTecnica: "Curvado",
        definicionTecnica: "Técnica que consiste en arquear la mateia prima."
      }
    ]
  },

  // FRUTOS SECOS Y SEMILLAS
  {
    codigoMateriaPrimaCUOC: "739",
    codigoMateriaPrimaAdeC: "739-1",
    materiaPrima: "Frutos secos y semillas",
    codigoOficioCUOC: "7393",
    codigoOficioAdeC: "7393",
    tipoMateriaPrima: "",
    oficio: "Trabajos en frutos secos y semillas",
    definicionOficio: "Se refiere a la producción de objetos con materias primas como el totumo, el coco y el calabazo y la tagua",
    tecnicas: [
      {
        codigoTecnicaAdeC: "73931",
        nombreTecnica: "Torneado en tagua",
        definicionTecnica: "Técnica para obtener piezas cilíndricas con el uso del torno. Aplica solo para la tagua."
      },
      {
        codigoTecnicaAdeC: "73932",
        nombreTecnica: "Labrado",
        definicionTecnica: "Técnica que mediante la incisión superficial del material logra texturas."
      },
      {
        codigoTecnicaAdeC: "73933",
        nombreTecnica: "Calado",
        definicionTecnica: "Técnica que mediante cortes se atraviesa la superficie logrando vacíos."
      }
    ]
  },

  // CESTERÍA
  {
    codigoMateriaPrimaCUOC: "734",
    codigoMateriaPrimaAdeC: "734",
    materiaPrima: "Fibras y Filamentos",
    codigoOficioCUOC: "7341",
    codigoOficioAdeC: "7341",
    tipoMateriaPrima: "",
    oficio: "Cestería",
    definicionOficio: "Consiste en desarrollar objetos que se caracterizan por su consistencia y estructura firme, lograda mediante el entrecruzamiento, armado o enrollamiento de fibras vegetales duras y semiduras, las cuales son adecuadas según el conocimiento del artesano o comunidad y la clase de objetos a elaborar.",
    tecnicas: [
      {
        codigoTecnicaAdeC: "73411",
        nombreTecnica: "Rollo en fibras",
        definicionTecnica: "Técnica que consiste en hacer un tejido en espiral con una estructra central o alma continua, sobre la que se enrollan fibras flexibles con las que se hacen amarres y costuras."
      },
      {
        codigoTecnicaAdeC: "73412",
        nombreTecnica: "Radial",
        definicionTecnica: "Técnica que consiste en hacer un tejido en espiral sobre una estructura armante."
      },
      {
        codigoTecnicaAdeC: "73413",
        nombreTecnica: "Entrecruzado",
        definicionTecnica: "Técnica que consiste en entretejer fibras entre una estructura armante y pasadas."
      }
    ]
  },

  // TEJEDURÍA
  {
    codigoMateriaPrimaCUOC: "734",
    codigoMateriaPrimaAdeC: "734",
    materiaPrima: "Fibras, Hilos y Filamentos",
    codigoOficioCUOC: "7331 7332 7333",
    codigoOficioAdeC: "7331-1",
    tipoMateriaPrima: "",
    oficio: "Tejeduría",
    definicionOficio: "Entrecruzamiento o anudado de uno o más hilos o fibras para la obtencion de diferentes telas y textiles de acuerdo a los materiales utilizados.",
    tecnicas: [
      {
        codigoTecnicaAdeC: "7331-11",
        nombreTecnica: "Tejido de punto",
        definicionTecnica: "Técnica que consiste en obtener un textil mediante la elaboración de mallas o bucles con máximo dos hilos continuos con aguja."
      },
      {
        codigoTecnicaAdeC: "7331-12",
        nombreTecnica: "Tejido plano",
        definicionTecnica: "Técnica que consiste en entrecruzar hilos en forma perpendicular denominados urdimbre y trama."
      },
      {
        codigoTecnicaAdeC: "7331-13",
        nombreTecnica: "Redes",
        definicionTecnica: "Técnica que consiste en enlazar un hilo sobre sí mismo que puede ir con o sin nudos."
      },
      {
        codigoTecnicaAdeC: "7331-14",
        nombreTecnica: "Anudados (macramé, frivolité y bolillo)",
        definicionTecnica: "Técnica que consiste en la combinación de nudos de diferetes complejidades, formando telas abiertas o diseños gráficos."
      },
      {
        codigoTecnicaAdeC: "7331-15",
        nombreTecnica: "Trenzado",
        definicionTecnica: "Técnica que consiste en entrelazar tres o más cabos para obtener cintas o tiras."
      },
      {
        codigoTecnicaAdeC: "7331-16",
        nombreTecnica: "Tejido en chaquira",
        definicionTecnica: "Técnica que consiste ensartar chaquira de uno o más hilos, y donde media una tradición ancestral indígena."
      }
    ]
  },

  // TEXTILES NO TEJIDOS
  {
    codigoMateriaPrimaCUOC: "734",
    codigoMateriaPrimaAdeC: "734",
    materiaPrima: "Fibras",
    codigoOficioCUOC: "",
    codigoOficioAdeC: "7331-2",
    tipoMateriaPrima: "",
    oficio: "Textiles no tejidos",
    definicionOficio: "Telas que se elaboran a partir de fibras directamente ya sea lana o fibras vegetales.",
    tecnicas: [
      {
        codigoTecnicaAdeC: "7331-21",
        nombreTecnica: "Afieltrado",
        definicionTecnica: "Técnica que consiste en la fricción y presión de fibras de lana cardadas y peinada para que se entrelacen y aglomeren de manera irreversible generando una tela."
      },
      {
        codigoTecnicaAdeC: "7331-22",
        nombreTecnica: "Textil vegetal (damagua, cabecinegro, yanchama)",
        definicionTecnica: "Técnica que surge a partir de la transformación de cortezas de árboles o vainas de palmas."
      },
      {
        codigoTecnicaAdeC: "7331-23",
        nombreTecnica: "Textil aglomerado por costura",
        definicionTecnica: "Telas elaboradas directamente a partir de fibras cosidas. La costura es la técnica por medio de la cual se genera una tela."
      }
    ]
  },

  // TRABAJOS EN TELA
  {
    codigoMateriaPrimaCUOC: "739",
    codigoMateriaPrimaAdeC: "739-3",
    materiaPrima: "Telas",
    codigoOficioCUOC: "",
    codigoOficioAdeC: "7399-2",
    tipoMateriaPrima: "",
    oficio: "Trabajos en tela",
    definicionOficio: "Elaboración de objetos textiles mediante la unión y/o superposición de telas generando elementos gráficos determinados.",
    tecnicas: [
      {
        codigoTecnicaAdeC: "7399-21",
        nombreTecnica: "Capas de tela",
        definicionTecnica: "Superposición de capas de tela cosidas entre sí, utilizando cortes como mecanismo de aperttura de color y formas"
      },
      {
        codigoTecnicaAdeC: "7399-22",
        nombreTecnica: "Calado en tela",
        definicionTecnica: "Técnica en la que la ornamentación se realiza sobre el deshilado de una tela."
      },
      {
        codigoTecnicaAdeC: "7399-23",
        nombreTecnica: "Tela sobre tela o aplicación en tela",
        definicionTecnica: "Superposición de telas o retazos con la técnica de la costura a mano"
      },
      {
        codigoTecnicaAdeC: "7399-24",
        nombreTecnica: "Fruncido",
        definicionTecnica: "Técnica basada en la generación de dobleces y costuras en la tela para lograr volúmen o tridimensionalidad"
      },
      {
        codigoTecnicaAdeC: "7399-25",
        nombreTecnica: "Bordado",
        definicionTecnica: "Técnica de transformación de telas o superficies textiles mediante la ejecución de labrados y/o altos relieves hechos en hilos y otros materiales flexibles."
      },
      {
        codigoTecnicaAdeC: "7399-26",
        nombreTecnica: "Técnicas de tintura por reserva",
        definicionTecnica: "Técnica mediante la cual se generan efectos de color en telas o hilos a partir del aislamiento o reserva en secciones en el proceso de tintura."
      }
    ]
  },

  // CERÁMICA
  {
    codigoMateriaPrimaCUOC: "731",
    codigoMateriaPrimaAdeC: "731-1",
    materiaPrima: "Arcilla",
    codigoOficioCUOC: "7314",
    codigoOficioAdeC: "7314-1",
    tipoMateriaPrima: "",
    oficio: "Cerámica",
    definicionOficio: "Consiste en la elaboración de productos utilitarios o decorativos, a partir de pastas cerámicas donde se deben realizar dos o más quemas a alta temperatura (entre 800 y 1280 grados centígrados)",
    tecnicas: [
      {
        codigoTecnicaAdeC: "7314-11",
        nombreTecnica: "Modelado en arcilla",
        definicionTecnica: "Técnica de formación de la pieza a partir del manejo de la arcilla con las manos mediante la cual se va dando la forma deseada hasta obtener el producto previo a acabados y quema."
      },
      {
        codigoTecnicaAdeC: "7314-12",
        nombreTecnica: "Rollo en arcilla",
        definicionTecnica: "Técnica consistente en la formación de rollos sólidos de arcilla que se trabaja en espiral para formar la base y posteriormente se procede a subir las paredes de la pieza mediante la repetición del procedimiento."
      },
      {
        codigoTecnicaAdeC: "7314-13",
        nombreTecnica: "Plancha o placa",
        definicionTecnica: "Técnica mediante la cual se elaboran piezas y objetos a partir de láminas o placas de arcilla."
      },
      {
        codigoTecnicaAdeC: "7314-14",
        nombreTecnica: "Torneado en arcilla",
        definicionTecnica: "Técnica para obtener piezas redondeadas, cilíndricas o cónicas a partir de un bloque de arcilla puesto sobre un torno mecanico o manual, accionandolo a medida que se va modelando con las manos."
      },
      {
        codigoTecnicaAdeC: "7314-15",
        nombreTecnica: "Torneado con tarraja",
        definicionTecnica: "Técnica para tornear el exterior o el interior de una pieza por medio de un brazo fijo que tiene una plantilla, la cual determina el contorno y forma del producto previo a acabados y quema."
      },
      {
        codigoTecnicaAdeC: "7314-16",
        nombreTecnica: "Vaciado en molde",
        definicionTecnica: "Técnica para elaborar piezas con barbotina que es vaciada dentro de un molde para copiar las formas internas del mismo y así generar el producto intermedio."
      }
    ]
  },

  // ALFARERÍA
  {
    codigoMateriaPrimaCUOC: "731",
    codigoMateriaPrimaAdeC: "731-1",
    materiaPrima: "Arcilla",
    codigoOficioCUOC: "7314",
    codigoOficioAdeC: "7314-2",
    tipoMateriaPrima: "",
    oficio: "Alfarería",
    definicionOficio: "Trabajo de tipo relativamente rústico de manera exclusiva en arcilla y cocción a temperaturas inferiores a 800 grados centigrado para la elaboración de vasijas y figuras decorativas",
    tecnicas: [
      {
        codigoTecnicaAdeC: "7314-21",
        nombreTecnica: "Modelado en arcilla",
        definicionTecnica: "Técnica de formación de la pieza a partir del manejo de la arcilla con las manos mediante la cual se va dando la forma deseada hasta obtener el producto previo a acabados y quema."
      },
      {
        codigoTecnicaAdeC: "7314-22",
        nombreTecnica: "Rollo en arcilla",
        definicionTecnica: "Técnica que consistente en la formación de rollos sólidos de arcilla que se trabaja en espiral para formar la base y posteriormente se procede a subir las paredes de la pieza mediante la repetición del procedimiento."
      },
      {
        codigoTecnicaAdeC: "7314-23",
        nombreTecnica: "Plancha o placa",
        definicionTecnica: "Ténica mediante la cual se elaboran piezas y objetos a partir de láminas o placas de arcilla."
      },
      {
        codigoTecnicaAdeC: "7314-24",
        nombreTecnica: "Torneado en arcilla",
        definicionTecnica: "Técnica para obtener piezas redondeadas, cilíndricas o cónicas a partir de un bloque de arcilla puesto sobre un torno mecanico o manual, accionandolo a medida que se va modelando con las manos."
      },
      {
        codigoTecnicaAdeC: "7314-25",
        nombreTecnica: "Apretón en molde",
        definicionTecnica: "Consiste en generar presión sobre una superficie preestablecida para copiar los detalles o improntas e incluso la forma; en un gran porcentaje, dicho apretón se hace con los dedos."
      }
    ]
  },

  // METALISTERÍA
  {
    codigoMateriaPrimaCUOC: "732",
    codigoMateriaPrimaAdeC: "732",
    materiaPrima: "Metales preciosos",
    codigoOficioCUOC: "7321",
    codigoOficioAdeC: "7321",
    tipoMateriaPrima: "",
    oficio: "Joyería",
    definicionOficio: "Consiste en la elaboración de artículos de adorno personal y de objetos decorativos mediante la transformación de metales preciosos, semipreciosos o no preciosos.",
    tecnicas: [
      {
        codigoTecnicaAdeC: "73211",
        nombreTecnica: "Modelado en cera perdida",
        definicionTecnica: "Técnica que modela la figura en cera, luego se recubre con un material refractario que forma un molde al quemar la cera. En la cavidad se vierte el metal y luego se retira el refractario."
      },
      {
        codigoTecnicaAdeC: "73212",
        nombreTecnica: "Laminado",
        definicionTecnica: "Técnica que consiste en obtener láminas delgadas de metal."
      },
      {
        codigoTecnicaAdeC: "73213",
        nombreTecnica: "Filigrana",
        definicionTecnica: "Técnica que consiste en soldar entre sí, hilos y bolitas de metal, conformando diseños calados de gran finura y delicadeza."
      },
      {
        codigoTecnicaAdeC: "73214",
        nombreTecnica: "Engastado",
        definicionTecnica: "Técnica que permite montar o incrustar piedras preciosas o semipreciosas en piezas de orfebrería."
      },
      {
        codigoTecnicaAdeC: "73215",
        nombreTecnica: "Embutido o repujado",
        definicionTecnica: "Técnica de transformación de láminas metálicas mediante golpes, presión y/o calor que generan figuras o relieves."
      }
    ]
  },

  // PAPEL
  {
    codigoMateriaPrimaCUOC: "739",
    codigoMateriaPrimaAdeC: "739-4",
    materiaPrima: "Papel",
    codigoOficioCUOC: "",
    codigoOficioAdeC: "7399-3",
    tipoMateriaPrima: "",
    oficio: "Trabajos en papel",
    definicionOficio: "Transformación del papel mediante diferentes técnicas para la elaboración de objetos tridimensionales.",
    tecnicas: [
      {
        codigoTecnicaAdeC: "7399-31",
        nombreTecnica: "Papel maché",
        definicionTecnica: "Técnica que consiste en la elaboración de piezas con papel reciclado, desmenuzado y convertido en una pasta moldeable."
      },
      {
        codigoTecnicaAdeC: "7399-32",
        nombreTecnica: "Capas de papel",
        definicionTecnica: "Técnica que consiste en superponer capas de papel que generan el volumen de un molde que puede ser interno o externo."
      },
      {
        codigoTecnicaAdeC: "7399-33",
        nombreTecnica: "Moldeado de pulpa de papel",
        definicionTecnica: "Técnica que consiste en mezclar fibras y agua para generar láminas de papel que responden a las características que se busquen."
      }
    ]
  },

  // BARNIZ DE PASTO (MOPA-MOPA)
  {
    codigoMateriaPrimaCUOC: "739",
    codigoMateriaPrimaAdeC: "739-5",
    materiaPrima: "Mopa-mopa",
    codigoOficioCUOC: "",
    codigoOficioAdeC: "7399-4",
    tipoMateriaPrima: "",
    oficio: "Barniz de Pasto",
    definicionOficio: "Técnica tradicional que consiste en la decoración sobre madera empleando láminas delgadas de resina Mopa-Mopa (Elaeagia Pastoensis Mora) teñida de varios colores que se adhieren a la superficie de madera.",
    tecnicas: [
      {
        codigoTecnicaAdeC: "7399-41",
        nombreTecnica: "Barniz de Pasto",
        definicionTecnica: "Técnica ancestral que decora superficies de madera con resina de mopa-mopa teñida que se adhiere mediante calor."
      }
    ]
  },

  // CACHO Y HUESO
  {
    codigoMateriaPrimaCUOC: "739",
    codigoMateriaPrimaAdeC: "739-2",
    materiaPrima: "Cacho y hueso",
    codigoOficioCUOC: "",
    codigoOficioAdeC: "7399-5",
    tipoMateriaPrima: "",
    oficio: "Trabajos en cacho y hueso",
    definicionOficio: "Elaboración de objetos a partir de la transformación de cuernos, huesos y conchas de animales.",
    tecnicas: [
      {
        codigoTecnicaAdeC: "7399-51",
        nombreTecnica: "Tallado",
        definicionTecnica: "Técnica que mediante el desbaste retira partes del material para lograr formas y volúmenes."
      },
      {
        codigoTecnicaAdeC: "7399-52",
        nombreTecnica: "Calado",
        definicionTecnica: "Técnica que mediante cortes se atraviesa la superficie logrando vacíos."
      },
      {
        codigoTecnicaAdeC: "7399-53",
        nombreTecnica: "Torneado",
        definicionTecnica: "Técnica para obtener piezas cilíndricas o redondeadas con el uso del torno."
      }
    ]
  },

  // ALAMBRISMO
  {
    codigoMateriaPrimaCUOC: "739",
    codigoMateriaPrimaAdeC: "739-7",
    materiaPrima: "Alambre",
    codigoOficioCUOC: "",
    codigoOficioAdeC: "7399-6",
    tipoMateriaPrima: "",
    oficio: "Alambrismo",
    definicionOficio: "Técnica que consiste en la elaboración de figuras tridimensionales mediante el modelado y ensamble de alambre.",
    tecnicas: [
      {
        codigoTecnicaAdeC: "7399-61",
        nombreTecnica: "Modelado en alambre",
        definicionTecnica: "Técnica que da forma al alambre mediante dobleces, torsión y soldadura para crear estructuras tridimensionales."
      }
    ]
  }
];

// Función auxiliar para búsqueda rápida por palabras clave
export function buscarOficioEnCatalogo(texto: string): OficioArtesanal[] {
  const keywords = texto.toLowerCase();
  return catalogoOficialArtesanias.filter(oficio => 
    oficio.oficio.toLowerCase().includes(keywords) ||
    oficio.materiaPrima.toLowerCase().includes(keywords) ||
    oficio.definicionOficio.toLowerCase().includes(keywords) ||
    oficio.tecnicas.some(t => 
      t.nombreTecnica.toLowerCase().includes(keywords) ||
      t.definicionTecnica.toLowerCase().includes(keywords)
    )
  );
}

// Función para obtener oficios por materia prima
export function obtenerOficiosPorMateriaPrima(materiaPrima: string): OficioArtesanal[] {
  return catalogoOficialArtesanias.filter(oficio =>
    oficio.materiaPrima.toLowerCase().includes(materiaPrima.toLowerCase())
  );
}

// Función para obtener todas las materias primas únicas
export function obtenerMateriasPrimas(): string[] {
  return Array.from(new Set(catalogoOficialArtesanias.map(o => o.materiaPrima)));
}

// Función para obtener todos los oficios únicos
export function obtenerOficios(): string[] {
  return Array.from(new Set(catalogoOficialArtesanias.map(o => o.oficio)));
}
