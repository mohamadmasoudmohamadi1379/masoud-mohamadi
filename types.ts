export interface Unit {
  id: number;
  name: string;
  pMax: number; // Maximum Capacity (MW)
  rMax: number; // Maximum Reserve (MW)
  mc: number;   // Marginal Cost ($/MWh)
}

export interface OptimizationResult {
  status: 'Optimal' | 'Infeasible';
  allocations: UnitAllocation[];
  totalCost: number;
  marketPrice: number; // Marginal Energy Price
  reservePrice: number; // Marginal Reserve Price
  totalGenP: number;
  totalGenR: number;
}

export interface UnitAllocation {
  unitId: number;
  p: number; // Allocated Power
  r: number; // Allocated Reserve
  cost: number;
}

export interface GlobalParams {
  demandTotal: number;
  reserveTotal: number;
}