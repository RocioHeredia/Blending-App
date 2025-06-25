document.addEventListener('alpine:init', () => {
  Alpine.data('optimizadorData', () => ({
    materias: [
      { nombre: '', dureza: '', tipo: 'vegetal' }
    ],
    costos: {},

    // Parámetros generales del modelo
    profit: 150,
    costStore: 5,
    maxVeg: 200,
    maxOil: 250,
    startEndStore: 500,
    maxStore: 1000,
    nbMonths: 6,

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
          if (
            this.costos[clave] === undefined ||
            this.costos[clave] === null ||
            this.costos[clave] === ''
          ) {
            alert(`Faltan los costos del mes ${mes} para la materia: ${m.nombre}`);
            return;
          }
        }
      }

      // 1. Crear RawMaterials
      const RawMaterials = this.materias.map(m => ({
        material: m.nombre,
        dureza: parseFloat(m.dureza),
        isVeg: m.tipo === 'vegetal' ? 1 : 0,
        isOil: m.tipo === 'aceitosa' ? 1 : 0
      }));

      // 2. Crear Costs
      let Costs = [];
      for (let m of this.materias) {
        for (let mes = 1; mes <= 6; mes++) {
          const clave = `${m.nombre}_${mes}`;
          costs.push({
            mes,
            material: m.nombre,
            costo: parseFloat(this.costos[clave])
          });
        }
      }

      // 3. Crear Parameters
      const Parameters = {
        profit: parseFloat(this.profit),
        costStore: parseFloat(this.costStore),
        maxVeg: parseFloat(this.maxVeg),
        maxOil: parseFloat(this.maxOil),
        startEndStore: parseFloat(this.startEndStore),
        maxStore: parseFloat(this.maxStore),
        nbMonths: parseInt(this.nbMonths)
      };

      // 4. Enviar al backend
      fetch('http://localhost:3000/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          materials: RawMaterials,
          costs: Costs,
          params: Parameters
        })
      })
        .then(response => response.json())
        .then(data => {
          console.log('Respuesta del backend:', data);
          alert('¡Optimización completada!');
          // Aquí podrías renderizar los resultados si querés
        })
        .catch(error => {
          console.error('Error al enviar datos:', error);
          alert('Hubo un error al comunicarse con el servidor.');
        });
    }
  }));
});

