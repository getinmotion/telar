// Detección de ubicaciones en México y otros países hispanohablantes
export const detectLocation = (text: string): { detected: boolean; location: string; type: 'city' | 'state' | 'country' | 'online' } | null => {
  if (!text || text.trim().length < 3) return null;
  
  const normalizedText = text.toLowerCase().trim();
  
  // Detectar "Online" o variaciones
  if (normalizedText.match(/\b(online|internet|digital|en línea|virtual|web)\b/)) {
    return { detected: true, location: 'Online', type: 'online' };
  }
  
  // Estados de México
  const mexicanStates = {
    'aguascalientes': 'Aguascalientes',
    'baja california': 'Baja California',
    'baja california sur': 'Baja California Sur',
    'campeche': 'Campeche',
    'chiapas': 'Chiapas',
    'chihuahua': 'Chihuahua',
    'coahuila': 'Coahuila',
    'colima': 'Colima',
    'durango': 'Durango',
    'guanajuato': 'Guanajuato',
    'guerrero': 'Guerrero',
    'hidalgo': 'Hidalgo',
    'jalisco': 'Jalisco',
    'méxico': 'Estado de México',
    'estado de méxico': 'Estado de México',
    'edomex': 'Estado de México',
    'michoacán': 'Michoacán',
    'morelos': 'Morelos',
    'nayarit': 'Nayarit',
    'nuevo león': 'Nuevo León',
    'oaxaca': 'Oaxaca',
    'puebla': 'Puebla',
    'querétaro': 'Querétaro',
    'quintana roo': 'Quintana Roo',
    'san luis potosí': 'San Luis Potosí',
    'sinaloa': 'Sinaloa',
    'sonora': 'Sonora',
    'tabasco': 'Tabasco',
    'tamaulipas': 'Tamaulipas',
    'tlaxcala': 'Tlaxcala',
    'veracruz': 'Veracruz',
    'yucatán': 'Yucatán',
    'zacatecas': 'Zacatecas'
  };
  
  // Ciudades principales de México
  const mexicanCities = {
    'ciudad de méxico': 'Ciudad de México',
    'cdmx': 'Ciudad de México',
    'df': 'Ciudad de México',
    'guadalajara': 'Guadalajara',
    'monterrey': 'Monterrey',
    'puebla': 'Puebla',
    'tijuana': 'Tijuana',
    'león': 'León',
    'juárez': 'Ciudad Juárez',
    'zapopan': 'Zapopan',
    'mérida': 'Mérida',
    'toluca': 'Toluca',
    'aguascalientes': 'Aguascalientes',
    'querétaro': 'Querétaro',
    'cancún': 'Cancún',
    'playa del carmen': 'Playa del Carmen',
    'tulum': 'Tulum',
    'morelia': 'Morelia',
    'san miguel de allende': 'San Miguel de Allende',
    'guanajuato': 'Guanajuato',
    'oaxaca': 'Oaxaca',
    'taxco': 'Taxco',
    'san cristóbal': 'San Cristóbal de las Casas',
    'chiapas': 'Chiapas',
    'veracruz': 'Veracruz',
    'acapulco': 'Acapulco',
    'puerto vallarta': 'Puerto Vallarta',
    'mazatlán': 'Mazatlán',
    'los cabos': 'Los Cabos',
    'cabo san lucas': 'Cabo San Lucas',
    'ensenada': 'Ensenada'
  };
  
  // Países hispanohablantes
  const countries = {
    'méxico': 'México',
    'mexico': 'México',
    'españa': 'España',
    'argentina': 'Argentina',
    'colombia': 'Colombia',
    'perú': 'Perú',
    'chile': 'Chile',
    'ecuador': 'Ecuador',
    'guatemala': 'Guatemala',
    'costa rica': 'Costa Rica',
    'panamá': 'Panamá',
    'venezuela': 'Venezuela',
    'bolivia': 'Bolivia',
    'paraguay': 'Paraguay',
    'uruguay': 'Uruguay',
    'nicaragua': 'Nicaragua',
    'honduras': 'Honduras',
    'el salvador': 'El Salvador'
  };
  
  // Detectar ciudades primero (más específico)
  for (const [key, value] of Object.entries(mexicanCities)) {
    if (normalizedText.includes(key)) {
      return { detected: true, location: value, type: 'city' };
    }
  }
  
  // Luego estados
  for (const [key, value] of Object.entries(mexicanStates)) {
    if (normalizedText.includes(key)) {
      return { detected: true, location: value, type: 'state' };
    }
  }
  
  // Finalmente países
  for (const [key, value] of Object.entries(countries)) {
    if (normalizedText.includes(key)) {
      return { detected: true, location: value, type: 'country' };
    }
  }
  
  return null;
};

export const getLocationEmoji = (type: 'city' | 'state' | 'country' | 'online'): string => {
  switch (type) {
    case 'city': return '🏙️';
    case 'state': return '🗺️';
    case 'country': return '🌎';
    case 'online': return '💻';
    default: return '📍';
  }
};
