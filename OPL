// Definición de tuplas
tuple RawMaterialData {
  key string name;
  float hardness;
  float isVeg;
  float isOil;
}

tuple CostData {
  key int month;
  key string material;
  float cost;
}

//profit: ganancia por tonelada de producto final.
//costStore: costo por almacenar una tonelada de material al mes.
//maxVeg/maxOil: límites máximos de uso de vegetales y aceites.
//startEndStore: stock inicial y final obligatorio.
//maxStore: capacidad máxima de almacenamiento por materia prima.
//nbMonths: cantidad total de meses.

tuple ProductionData {
  float profit;
  float costStore;
  float maxVeg;
  float maxOil;
  float startEndStore;
  float maxStore;
  int nbMonths;
}

// Conjuntos basados en tuplas
{RawMaterialData} RawMaterials = ...;
{CostData} Costs = ...;
{ProductionData} Parameters = ...;

// Obtener valores de parámetros
int NbMonths = first(Parameters).nbMonths;
range Months = 1..NbMonths;
range R = 0..NbMonths;
float ProfitProd = first(Parameters).profit;
float CostStore = first(Parameters).costStore;
float MaxVeg = first(Parameters).maxVeg;
float MaxOil = first(Parameters).maxOil;
float StartEndStore = first(Parameters).startEndStore;
float MaxStore = first(Parameters).maxStore;

// Variables de decisión
//Buy: cantidad comprada de cada materia prima cada mes.
dvar float+ Buy[m in Months][r in RawMaterials] in 0..infinity;
//Store: cantidad almacenada al final de cada mes.
dvar float+ Store[m in R][r in RawMaterials] in 0..MaxStore;
//Use: cantidad usada para producir.
dvar float+ Use[m in Months][r in RawMaterials] in 0..infinity;
//p: toneladas de producto final producidas cada mes.
dvar float+ p[m in Months] in 0..infinity;



// Expresiones
//Profit: suma de ingresos por producción (profit * p[m])
dexpr float Profit = sum(m in Months) ProfitProd * p[m];
//Cost: suma de compras + costos de almacenamiento
dexpr float Cost = sum(m in Months, r in RawMaterials) 
    (item(Costs, <m, r.name>).cost * Buy[m][r] + CostStore * Store[m][r]);

// Función objetivo
maximize Profit - Cost;

subject to {
  forall(m in Months) {
    // Restricciones de uso máximo por mes
    ctMaxUseVeg: 
      sum(r in RawMaterials) r.isVeg * Use[m][r] <= MaxVeg;
    
    ctMaxUseOil: 
      sum(r in RawMaterials) r.isOil * Use[m][r] <= MaxOil;
    
    // Restricciones de dureza
    //Asegura que la mezcla resultante tenga dureza entre 3 y 6.
    ctHard1: 
      sum(r in RawMaterials) r.hardness * Use[m][r] - 6 * p[m] <= 0;
    
    ctHard2: 
      sum(r in RawMaterials) r.hardness * Use[m][r] - 3 * p[m] >= 0;
    
    // Balance de materiales
    //La cantidad usada debe coincidir con la cantidad de producto producido.
    ctMatBal: 
      sum(r in RawMaterials) Use[m][r] - p[m] == 0;
  }
  
  // Balance de inventario
  //Inventario anterior + compras = uso + inventario actual.
  forall(r in RawMaterials, m in Months)
    ctInvBal: 
      Store[m-1][r] + Buy[m][r] == Use[m][r] + Store[m][r];
  
  // Inventarios iniciales y finales
  //Garantiza niveles iniciales y finales de inventario.
  forall(r in RawMaterials) {
    ctStartInv: Store[0][r] == StartEndStore;
    ctEndInv: Store[NbMonths][r] == StartEndStore;
  }
}

// Definición de tuplas para la solución
tuple pSolutionT {
  int month;
  float value;
};

tuple MaterialSolutionT {
  string material;
  int month;
  float value;
};

tuple StoreSolutionT {
  string material;
  int period;
  float value;
};

// Colecciones para almacenar la solución
{pSolutionT} pSolution = {<m, p[m]> | m in Months};
{MaterialSolutionT} BuySolution = {<r.name, m, Buy[m][r]> | m in Months, r in RawMaterials};
{StoreSolutionT} StoreSolution = {<r.name, m, Store[m][r]> | m in R, r in RawMaterials};
{MaterialSolutionT} UseSolution = {<r.name, m, Use[m][r]> | m in Months, r in RawMaterials};

// Mostrar el plan para cada mes y cada materia prima
execute DISPLAY {
  for (var m in Months)
    for (var r in RawMaterials)
      writeln("plan[", m, "][", r.name, "] = <buy:", Buy[m][r], 
              ",use:", Use[m][r], ",store:", Store[m][r], ">");
}
