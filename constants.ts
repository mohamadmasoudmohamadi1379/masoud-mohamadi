import { Unit, GlobalParams } from './types';

export const INITIAL_UNITS: Unit[] = [
  { id: 1, name: 'Unit 1', pMax: 250, rMax: 0, mc: 2 },
  { id: 2, name: 'Unit 2', pMax: 230, rMax: 160, mc: 17 },
  { id: 3, name: 'Unit 3', pMax: 240, rMax: 190, mc: 20 },
  { id: 4, name: 'Unit 4', pMax: 250, rMax: 0, mc: 28 },
];

export const INITIAL_PARAMS: GlobalParams = {
  demandTotal: 600,
  reserveTotal: 250,
};