
// Normaliza texto para búsquedas (quita tildes, mayúsculas, caracteres especiales, etc.)
export const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
};


// Busca un término en un array de campos de texto de forma flexible
export const searchInFields = (searchTerm, fields) => {
  if (!searchTerm || !Array.isArray(fields)) return false;
  
  const normalizedTerm = normalizeText(searchTerm);
  
  return fields.some(field => {
    const normalizedField = normalizeText(field || '');
    return normalizedField.includes(normalizedTerm);
  });
};