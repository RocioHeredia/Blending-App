/*********************************************
 * OPL 22.1.1.0 Model
 * Author: Usuario
 * Creation Date: 8 abr. 2025 at 22:09:32
 *********************************************/
dvar float+ ProductoA;
dvar float+ ProductoB;

minimize
  ProductoA * 0.6 + ProductoB * 0.2;
  
subject to {
  0.30 * ProductoA + 0.05 * ProductoB >= 25;
  0.01 * ProductoA + 0.07 * ProductoB >= 6;
  0.10 * ProductoA + 0.10 * ProductoB >= 30;
};