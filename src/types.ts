export interface Warehouse {
  name: string;
  coordinates: [number, number];
}

export interface Bee {
  path: number[];
  fitness: number;
  type: 'scout' | 'onlooker' | 'employed';
  currentPosition: [number, number];
}

export interface Solution {
  path: number[];
  distance: number;
}

export interface BeeColonyState {
  bees: Bee[];
  bestSolution: Solution;
  employedBees: Bee[];
  onlookerBees: Bee[];
  scoutBees: Bee[];
}