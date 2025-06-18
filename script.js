document.addEventListener('alpine:init', () => {
  Alpine.data('optimizadorData', () => ({
    materias: [
      { nombre: '', dureza: '', tipo: 'vegetal' }
    ],
    costos: {},

    agregarFila() {
      this.materias.push({ nombre: '', dureza: '', tipo: 'vegetal' });
    },

    eliminarFila(index) {
      this.materias.splice(index, 1);
    },

    validarYEnviar() {
      if (this.materias.length === 0) {
        alert('Debe ingresar al menos una materia prima.');
        return;
      }

      for (let m of this.materias) {
        if (!m.nombre || !m.dureza) {
          alert('Complete todos los campos de materia prima.');
          return;
        }
        for (let mes = 1; mes <= 6; mes++) {
          const clave = `${m.nombre}_${mes}`;
          if (this.costos[clave] === undefined || this.costos[clave] === null || this.costos[clave] === '') {
            alert(`Faltan los costos del mes ${mes} para la materia: ${m.nombre}`);
            return;
          }
        }
      }

      // Envío simulado
      console.log('Datos a enviar:');
      console.log('Materias:', this.materias);
      console.log('Costos:', this.costos);

      alert('¡Datos validados correctamente! Ahora podés enviarlos al backend.');
    }
  }));
});
