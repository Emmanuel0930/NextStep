// repair_racha5.js
// Upsert retroactivo de la insignia '5 Días Activo' para cuentas que tienen rachaActual >= 5.
// Ajusta el nombre de la colección de rachas si tu colección usa otro nombre.

const rachasCollName = 'rachas'; // <-- AJUSTA si es necesario
const rachasColl = db.getCollection(rachasCollName);
const insColl = db.getCollection('insignias');

print('coleccion rachas usada:', rachasCollName);

const cursor = rachasColl.find({ rachaActual: { $gte: 5 } });
let count = 0;
cursor.forEach(r => {
  insColl.updateOne(
    { cuentaId: r.cuentaId, nombre: '5 Días Activo' },
    {
      $set: { obtenida: true, fechaObtenida: new Date() },
      $setOnInsert: { descripcion: 'Has iniciado sesión 5 días consecutivos', icono: '🔥', notificacionEnviada: false }
    },
    { upsert: true }
  );
  count++;
});
print('Insignias 5 Días Activo upsertadas para cuentas encontradas:', count);
