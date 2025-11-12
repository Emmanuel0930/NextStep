// badgeFactory.js
// Centraliza las plantillas de insignias (Factory pattern) y comprobaciones de desbloqueo

export const getBadgeTemplates = () => {
  return [
    {
      key: 'perfil_completo',
      nombre: 'Perfil Completo',
      descripcion: 'Completa los 4 niveles de tu perfil',
      icono: '🌟',
      puntosBonus: 100
    },
    {
      key: '5_dias_activo',
      nombre: '5 Días Activo',
      descripcion: 'Entra 5 días consecutivos para mantener la racha',
      icono: '🔥',
      puntosBonus: 50
    },
    {
      key: 'primera_postulacion',
      nombre: 'Primera Postulación',
      descripcion: 'Envía tu primera postulación a una oferta',
      icono: '🚀',
      puntosBonus: 10
    }
  ];
};

// Compara una plantilla contra las insignias que trae el servidor
export const isTemplateUnlocked = (template, serverInsignias = []) => {
  if (!Array.isArray(serverInsignias)) return false;
  // Normalizar string: eliminar tildes y comparar en minúsculas
  const normalize = (s = '') =>
    String(s)
      .normalize('NFD')
      .normalize('NFC')
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  const targetName = normalize(template.nombre || template.key || '');
  const targetIcon = (template.icono || '').toString();

  return serverInsignias.some(si => {
    if (!si) return false;
    const nombreServer = si.nombre || si.nombreInsignia || si.tipo || '';
    const iconoServer = si.icono || '';

    const nServer = normalize(nombreServer);

    if (nServer && targetName && nServer === targetName) return true;

    // Fallback: comparar icono o key directa
    if (iconoServer && iconoServer === targetIcon) return true;

    return false;
  });
};
