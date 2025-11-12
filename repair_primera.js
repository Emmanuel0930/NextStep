// repair_primera.js
// Upsert retroactivo de la insignia 'Primera Postulación' para cuentas que tienen al menos una postulación.
// Ajusta el nombre de la colección de interacciones si tu colección usa otro nombre en Atlas.

const appsCollName = 'interaccionempleoscuentas'; // <-- AJUSTA si es necesario
const insColl = db.getCollection('insignias');
const appsColl = db.getCollection(appsCollName);

print('coleccion de aplicaciones usada:', appsCollName);

const cuentaIds = appsColl.distinct('cuentaId', { estado: 'postulado' });
print('Cuentas con postulaciones encontradas:', cuentaIds.length);

let counter = 0;
cuentaIds.forEach(cid => {
  const res = insColl.updateOne(
    { cuentaId: cid, nombre: 'Primera Postulación' },
    {
      $set: {
        obtenida: true,
        notificacionEnviada: true,
        fechaObtenida: new Date()
      },
      $setOnInsert: {
        descripcion: 'Envía tu primera postulación a una oferta',
        icono: '🚀'
      }
    },
    { upsert: true }
  );
  if (res.matchedCount || res.upsertedCount) counter++;
});

print('Operación completada. Documentos procesados (matched or upserted):', counter);
