document.addEventListener('alpine:init', () => {
  Alpine.data('app', () => ({
    vista: 'inicio',

    cargando: false,
    resultadoListo: false,
    mostrarBotonVerResultados:false,
    materias: [
      { nombre: '', dureza: '', tipo: 'Vegetal' }
    ],
    costos: {},

    vistaPrevia: null,

    maxBeneficio: [],
    buySolution: [],
    useSolution: [],
    storeSolution: [],   
    
    
    // Parámetros del modelo
    profit: 150,
    costStore: 4,
    maxVeg: 200,
    maxOil: 250,
    startEndStore: 500,
    maxStore: 1000,
    nbMonths: 6,

    agregarFila() {
      this.materias.push({ nombre: '', dureza: '', tipo: 'Vegetal' });
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

      const RawMaterials = this.materias.map(m => ({
        name: m.nombre,
        hardness: parseFloat(m.dureza),
        isVeg: m.tipo === 'Vegetal' ? 1 : 0,
        isOil: m.tipo === 'Aceitoso' ? 1 : 0
      }));

      let Costs = [];
      for (let m of this.materias) {
        for (let mes = 1; mes <= 6; mes++) {
          const clave = `${m.nombre}_${mes}`;
          Costs.push({
            month:mes,
            material: m.nombre,
            cost: parseFloat(this.costos[clave])
          });
        }
      }

      const Parameters = {
        profit: parseFloat(this.profit),
        costStore: parseFloat(this.costStore),
        maxVeg: parseFloat(this.maxVeg),
        maxOil: parseFloat(this.maxOil),
        startEndStore: parseFloat(this.startEndStore),
        maxStore: parseFloat(this.maxStore),
        nbMonths: parseInt(this.nbMonths)
      };

      
      this.cargando = true;
      this.resultadoListo = false;

      fetch('http://localhost:3000/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          RawMaterials,
          Costs,
          Parameters
        })
      })
        .then(response => response.json())
        .then(data => {
          console.log('Respuesta del backend:', data);
          this.maxBeneficio = parseFloat(data.maxBeneficio[0].maxBeneficio);
          this.buySolution = data.buySolution;
          this.useSolution = data.useSolution;
          this.storeSolution = data.storeSolution;

          this.cargando = false;
          this.resultadoListo = true;
          this.mostrarBotonVerResultados = true;

        })
        .catch(error => {
          console.error('Error al enviar datos:', error);
          alert('Hubo un error al comunicarse con el servidor.');
          this.cargando = false;
        });
    },

    mostrarDatos() {
      let costs = [];
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

      this.vistaPrevia = {
        materias: this.materias,
        costos: this.costos,
        costs: costs
      };
    },

    mesesDisponibles: [1, 2, 3, 4, 5, 6],

    filtrarPorMes(mes) {
      const materialesMes = new Set();

      this.buySolution.forEach(item => { if (parseInt(item.month) === mes) materialesMes.add(item.material); });
      this.storeSolution.forEach(item => { if (parseInt(item.period) === mes) materialesMes.add(item.material); });
      this.useSolution.forEach(item => { if (parseInt(item.month) === mes) materialesMes.add(item.material); });

      return Array.from(materialesMes).map(material => {
        const compraObj = this.buySolution.find(i => i.material === material && parseInt(i.month) === mes);
        const almacenamientoObj = this.storeSolution.find(i => i.material === material && parseInt(i.period) === mes);
        const usoObj = this.useSolution.find(i => i.material === material && parseInt(i.month) === mes);

        return {
          material: material,
          compra: parseFloat(compraObj?.value || 0),
          almacenamiento: parseFloat(almacenamientoObj?.value || 0),
          uso: parseFloat(usoObj?.value || 0)
        };
      });
    },

    resetResultados() {
      this.resultadoListo = false;
      this.maxBeneficio = 0;
      this.buySolution = [];
      this.useSolution = [];
      this.storeSolution = [];
    },

    ejecuciones: [],

    verEjecucion(ejecucion) {
      this.maxBeneficio = ejecucion.maxBeneficio;
      this.buySolution = ejecucion.buySolution;
      this.useSolution = ejecucion.useSolution;
      this.storeSolution = ejecucion.storeSolution;
      this.vista = 'resultados';
    },

    cargarEjecuciones() {
      fetch('http://localhost:3000/optimize/executions')
        .then(res => res.json())
        .then(data => {
          this.ejecuciones = data;
        })
        .catch(err => {
          console.error('Error cargando ejecuciones:', err);
        });
    },

// Agregado para mostrar gráficos
    verGraficos(ejecucion) {
      this.vista = 'graficos';
      this.maxBeneficio = ejecucion.maxBeneficio;
      this.buySolution = ejecucion.buySolution;
      this.useSolution = ejecucion.useSolution;
      this.storeSolution = ejecucion.storeSolution;

      this.$nextTick(() => {
        this.generarGraficos();
      });
    },

    
    generarGraficos() {
      const meses = [1, 2, 3, 4, 5, 6];
      // Obtener la lista única de materias de buySolution, useSolution o storeSolution (cualquiera que tenga datos)
      const materias = Array.from(new Set([
        ...this.buySolution.map(e => e.material),
        ...this.useSolution.map(e => e.material),
        ...this.storeSolution.map(e => e.material),
      ]));

      const generarDataset = (source) => {
        return materias.map(material => {
          return {
            label: material,
            data: meses.map(mes => {
              // Buscar si existe un dato para ese mes y material
              const item = source.find(e => {
                const periodo = parseInt(e.month ?? e.period);
                return periodo === mes && e.material === material;
              });
              return item ? Number(item.value) : 0;
            }),
            backgroundColor: this.colorAleatorio(),
            borderWidth: 1
          };
        });
      };

      const crearGrafico = (id, datasets, titulo) => {
        const ctx = document.getElementById(id).getContext('2d');
        if (ctx.chart) ctx.chart.destroy();
        ctx.chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: meses.map(m => 'Mes ' + m),
            datasets: datasets
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: titulo
              },
              legend: {
                position: 'top',
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      };

      crearGrafico('graficoCompra', generarDataset(this.buySolution), 'Compra por mes');
      crearGrafico('graficoUso', generarDataset(this.useSolution), 'Uso por mes');
      crearGrafico('graficoAlmacen', generarDataset(this.storeSolution), 'Almacenamiento por mes');
    },

    colorAleatorio() {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      return `rgba(${r}, ${g}, ${b}, 0.6)`;
    }

  }));
});
