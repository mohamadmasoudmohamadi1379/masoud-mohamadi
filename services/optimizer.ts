import { Unit, OptimizationResult, UnitAllocation } from '../types';

/**
 * Solves the Economic Dispatch problem with coupled P+R constraints.
 * 
 * Logic derived from the constraint structure:
 * Minimize Sum(MC_i * p_i)
 * s.t.
 * 1) Sum(p_i) = Demand
 * 2) Sum(r_i) = Reserve
 * 3) p_i + r_i <= P_max_i
 * 4) r_i <= R_max_i
 * 
 * Since Reserve (r) has 0 cost in the objective function but consumes capacity
 * that could be used for Energy (p), the optimal strategy is:
 * 1. Prioritize assigning Reserve to units with HIGHER Marginal Cost (MC).
 *    Why? Because displacing Energy on high MC units saves less money (or costs 0 if they wouldn't run anyway).
 *    Displacing Energy on low MC units is expensive (opportunity cost).
 * 2. After fixing Reserves, assign Energy to remaining capacity prioritizing LOWER MC.
 */
const solveDispatch = (units: Unit[], demand: number, reserve: number): { allocations: UnitAllocation[], cost: number, feasible: boolean } => {
  // Clone units to track remaining capacity locally
  const workingUnits = units.map(u => ({ ...u, p: 0, r: 0, capacityRemaining: u.pMax }));
  
  let remainingReserve = reserve;
  let remainingDemand = demand;
  
  // --- Step 1: Allocate Reserves (Sort by MC Descending) ---
  // We prefer to put reserves on expensive units so cheap units are free for generation.
  const unitsForReserve = [...workingUnits].sort((a, b) => b.mc - a.mc);
  
  for (const unit of unitsForReserve) {
    if (remainingReserve <= 0) break;
    
    // Max reserve allowed on this unit is constrained by R_max and P_max
    const possibleR = Math.min(unit.rMax, unit.pMax);
    const allocR = Math.min(possibleR, remainingReserve);
    
    unit.r = allocR;
    unit.capacityRemaining -= allocR;
    remainingReserve -= allocR;
  }

  // --- Step 2: Allocate Energy (Sort by MC Ascending) ---
  // We fill demand using cheap units first, using whatever capacity is left after reserves.
  const unitsForEnergy = [...workingUnits].sort((a, b) => a.mc - b.mc);
  
  for (const unit of unitsForEnergy) {
    if (remainingDemand <= 0) break;
    
    const allocP = Math.min(unit.capacityRemaining, remainingDemand);
    
    unit.p = allocP;
    unit.capacityRemaining -= allocP;
    remainingDemand -= allocP;
  }

  // --- Step 3: Calculate Costs & Validate ---
  let totalCost = 0;
  const allocations: UnitAllocation[] = workingUnits.map(u => {
    const cost = u.p * u.mc;
    totalCost += cost;
    return {
      unitId: u.id,
      p: u.p,
      r: u.r,
      cost
    };
  }).sort((a, b) => a.unitId - b.unitId); // Sort back by ID for display

  // Check feasibility (allow small float error)
  const feasible = remainingReserve <= 1e-5 && remainingDemand <= 1e-5;

  return { allocations, cost: totalCost, feasible };
};

/**
 * Main optimization function that also calculates marginal prices using finite difference.
 */
export const optimizeSystem = (units: Unit[], demandTotal: number, reserveTotal: number): OptimizationResult => {
  // 1. Base Run
  const baseRun = solveDispatch(units, demandTotal, reserveTotal);

  if (!baseRun.feasible) {
    return {
      status: 'Infeasible',
      allocations: [],
      totalCost: 0,
      marketPrice: 0,
      reservePrice: 0,
      totalGenP: 0,
      totalGenR: 0
    };
  }

  // 2. Marginal Price Calculation (Finite Difference Method)
  const delta = 1; // 1 MW increment
  
  // Scenario: Demand + delta
  const demandRun = solveDispatch(units, demandTotal + delta, reserveTotal);
  const marketPrice = demandRun.feasible ? (demandRun.cost - baseRun.cost) / delta : 0;

  // Scenario: Reserve + delta
  const reserveRun = solveDispatch(units, demandTotal, reserveTotal + delta);
  const reservePrice = reserveRun.feasible ? (reserveRun.cost - baseRun.cost) / delta : 0;

  // Calculate Totals
  const totalGenP = baseRun.allocations.reduce((sum, a) => sum + a.p, 0);
  const totalGenR = baseRun.allocations.reduce((sum, a) => sum + a.r, 0);

  return {
    status: 'Optimal',
    allocations: baseRun.allocations,
    totalCost: baseRun.cost,
    marketPrice: marketPrice,
    reservePrice: reservePrice,
    totalGenP,
    totalGenR
  };
};