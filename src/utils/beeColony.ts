import { Warehouse, Bee, BeeColonyState } from "../types";

function calculateDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateTotalDistance(
  path: number[],
  warehouses: Warehouse[],
  startPoint: [number, number]
): number {
  if (path.length === 0) return Number.MAX_SAFE_INTEGER;

  let totalDistance = calculateDistance(
    startPoint,
    warehouses[path[0]].coordinates
  );

  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += calculateDistance(
      warehouses[path[i]].coordinates,
      warehouses[path[i + 1]].coordinates
    );
  }

  totalDistance += calculateDistance(
    warehouses[path[path.length - 1]].coordinates,
    startPoint
  );

  // Validar si la distancia total es finita
  if (!isFinite(totalDistance)) {
    totalDistance = Number.MAX_SAFE_INTEGER;
  }

  return totalDistance;
}

function generateNeighborSolution(path: number[]): number[] {
  const newPath = [...path];
  const idx1 = Math.floor(Math.random() * newPath.length);
  let idx2 = Math.floor(Math.random() * newPath.length);
  let idx3 = Math.floor(Math.random() * newPath.length);

  while (idx1 === idx2) {
    idx2 = Math.floor(Math.random() * newPath.length);
  }
  while (idx3 === idx1 || idx3 === idx2) {
    idx3 = Math.floor(Math.random() * newPath.length);
  }

  // Intercambiar tres ciudades
  [newPath[idx1], newPath[idx2], newPath[idx3]] = [
    newPath[idx2],
    newPath[idx3],
    newPath[idx1],
  ];
  return newPath;
}

function generateRandomPositionInArea(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number
): [number, number] {
  const lat = minLat + Math.random() * (maxLat - minLat);
  const lng = minLng + Math.random() * (maxLng - minLng);
  return [lat, lng];
}

export function initializeBeeColony(
  warehouses: Warehouse[],
  startPoint: [number, number],
  populationSize: number = 50 // Incrementar el tamaño de la población
): BeeColonyState {
  const employedCount = Math.floor(populationSize * 0.5);
  const onlookerCount = Math.floor(populationSize * 0.3);
  const scoutCount = populationSize - employedCount - onlookerCount;

  const initialPath = warehouses.map((_, idx) => idx);

  // Calcular los límites del área basada en los almacenes
  const allCoordinates = warehouses.map((w) => w.coordinates);
  const lats = allCoordinates.map((coord) => coord[0]);
  const lngs = allCoordinates.map((coord) => coord[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const employedBees: Bee[] = Array.from({ length: employedCount }, () => {
    const path = shuffleArray(initialPath);
    const totalDistance = calculateTotalDistance(path, warehouses, startPoint);
    const fitness = 1 / totalDistance;
    const position = generateRandomPositionInArea(
      minLat,
      maxLat,
      minLng,
      maxLng
    );
    return {
      type: "employed",
      path,
      fitness,
      trials: 0,
      currentPosition: position,
      targetIndex: 0,
    };
  });

  const onlookerBees: Bee[] = Array.from({ length: onlookerCount }, () => {
    const position = generateRandomPositionInArea(
      minLat,
      maxLat,
      minLng,
      maxLng
    );
    return {
      type: "onlooker",
      path: [],
      fitness: 0,
      trials: 0,
      currentPosition: position,
      targetIndex: 0,
    };
  });

  const scoutBees: Bee[] = Array.from({ length: scoutCount }, () => {
    const position = generateRandomPositionInArea(
      minLat,
      maxLat,
      minLng,
      maxLng
    );
    return {
      type: "scout",
      path: [],
      fitness: 0,
      trials: 0,
      currentPosition: position,
    };
  });

  const allBees = [...employedBees, ...onlookerBees, ...scoutBees];

  const bestBee = employedBees.reduce((best, bee) =>
    bee.fitness > best.fitness ? bee : best
  );

  return {
    bees: allBees,
    bestSolution: {
      path: bestBee.path,
      distance: 1 / bestBee.fitness,
      fitness: bestBee.fitness,
    },
    lastImprovementIteration: 0,
  };
}

function shuffleArray(array: number[]): number[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function performBeeColonyIteration(
  currentState: BeeColonyState,
  warehouses: Warehouse[],
  startPoint: [number, number],
  iteration: number
): BeeColonyState {
  const limit = 50; // Incrementar el límite de intentos sin mejora

  // Calcular los límites del área basada en los almacenes
  const allCoordinates = warehouses.map((w) => w.coordinates);
  const lats = allCoordinates.map((coord) => coord[0]);
  const lngs = allCoordinates.map((coord) => coord[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Actualizar abejas empleadas
  const employedBees = currentState.bees.filter(
    (bee) => bee.type === "employed"
  ) as Bee[];
  const updatedEmployedBees = employedBees.map((bee) => {
    const newPath = generateNeighborSolution(bee.path);
    const newDistance = calculateTotalDistance(newPath, warehouses, startPoint);
    const newFitness = 1 / newDistance;

    if (newFitness > bee.fitness) {
      return {
        ...bee,
        path: newPath,
        fitness: newFitness,
        trials: 0,
      };
    } else {
      return {
        ...bee,
        trials: bee.trials + 1,
      };
    }
  });

  // Calcular probabilidades basadas en el fitness
  const totalFitness = updatedEmployedBees.reduce(
    (sum, bee) => sum + bee.fitness,
    0
  );
  const probabilities = updatedEmployedBees.map(
    (bee) => bee.fitness / totalFitness
  );

  // Actualizar abejas observadoras
  const onlookerBees = currentState.bees.filter(
    (bee) => bee.type === "onlooker"
  ) as Bee[];
  const updatedOnlookerBees = onlookerBees.map((bee) => {
    // Seleccionar una abeja empleada basada en las probabilidades
    let selectedBeeIndex = 0;
    let r = Math.random();
    while (r > 0) {
      r = r - probabilities[selectedBeeIndex];
      selectedBeeIndex++;
    }
    selectedBeeIndex = Math.max(0, selectedBeeIndex - 1);
    const selectedEmployedBee = updatedEmployedBees[selectedBeeIndex];

    // Generar una solución vecina
    const newPath = generateNeighborSolution(selectedEmployedBee.path);
    const newDistance = calculateTotalDistance(newPath, warehouses, startPoint);
    const newFitness = 1 / newDistance;

    if (newFitness > selectedEmployedBee.fitness) {
      selectedEmployedBee.path = newPath;
      selectedEmployedBee.fitness = newFitness;
      selectedEmployedBee.trials = 0;
    } else {
      selectedEmployedBee.trials += 1;
    }

    // Actualizar la posición de la abeja observadora
    const targetIndex = bee.targetIndex || 0;
    const path = selectedEmployedBee.path;
    const nextWarehouseIndex = path[targetIndex % path.length];
    const nextWarehouse = warehouses[nextWarehouseIndex];
    const currentPosition = bee.currentPosition;

    const newPosition = moveTowards(
      currentPosition,
      nextWarehouse.coordinates,
      0.001
    );

    const distanceToWarehouse = calculateEuclideanDistance(
      newPosition,
      nextWarehouse.coordinates
    );

    let newTargetIndex = targetIndex;
    if (distanceToWarehouse < 0.0001) {
      // Ha llegado al almacén, avanzar al siguiente
      newTargetIndex = targetIndex + 1;
    }

    return {
      ...bee,
      currentPosition: newPosition,
      targetIndex: newTargetIndex,
    };
  });

  // Actualizar abejas exploradoras
  const scoutBees = currentState.bees.filter(
    (bee) => bee.type === "scout"
  ) as Bee[];
  const updatedScoutBees = scoutBees.map((bee) => {
    const newPosition = generateRandomPositionInArea(
      minLat,
      maxLat,
      minLng,
      maxLng
    );
    return {
      ...bee,
      currentPosition: newPosition,
    };
  });

  // Reemplazar abejas empleadas que han excedido el límite de intentos
  const finalEmployedBees = updatedEmployedBees.map((bee) => {
    if (bee.trials >= limit) {
      const newPath = shuffleArray(warehouses.map((_, idx) => idx));
      const newDistance = calculateTotalDistance(
        newPath,
        warehouses,
        startPoint
      );
      const newFitness = 1 / newDistance;
      const newPosition = generateRandomPositionInArea(
        minLat,
        maxLat,
        minLng,
        maxLng
      );
      return {
        ...bee,
        path: newPath,
        fitness: newFitness,
        trials: 0,
        targetIndex: 0,
        currentPosition: newPosition,
      };
    } else {
      return bee;
    }
  });

  // Actualizar posiciones de las abejas empleadas
  const beesWithPositions = finalEmployedBees.map((bee) => {
    const targetIndex = bee.targetIndex || 0;
    const path = bee.path;
    const nextWarehouseIndex = path[targetIndex % path.length];
    const nextWarehouse = warehouses[nextWarehouseIndex];
    const currentPosition = bee.currentPosition;

    // Moverse hacia el siguiente almacén
    const newPosition = moveTowards(
      currentPosition,
      nextWarehouse.coordinates,
      0.001
    );

    const distanceToWarehouse = calculateEuclideanDistance(
      newPosition,
      nextWarehouse.coordinates
    );

    let newTargetIndex = targetIndex;
    if (distanceToWarehouse < 0.0001) {
      // Ha llegado al almacén, avanzar al siguiente
      newTargetIndex = targetIndex + 1;
    }

    return {
      ...bee,
      currentPosition: newPosition,
      targetIndex: newTargetIndex,
    };
  });

  const allBees = [
    ...beesWithPositions,
    ...updatedOnlookerBees,
    ...updatedScoutBees,
  ];

  // Encontrar la mejor solución
  const bestBee = beesWithPositions.reduce((best, bee) =>
    bee.fitness > best.fitness ? bee : best
  );

  let bestSolution = currentState.bestSolution;
  let lastImprovementIteration = currentState.lastImprovementIteration;

  if (bestBee.fitness > (currentState.bestSolution?.fitness || 0)) {
    bestSolution = {
      path: bestBee.path,
      distance: 1 / bestBee.fitness,
      fitness: bestBee.fitness,
    };
    lastImprovementIteration = iteration;
  }

  return {
    bees: allBees,
    bestSolution,
    lastImprovementIteration,
  };
}

function moveTowards(
  currentPosition: [number, number],
  targetPosition: [number, number],
  stepSize: number
): [number, number] {
  const [lat1, lon1] = currentPosition;
  const [lat2, lon2] = targetPosition;

  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;

  const distance = Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon);

  if (distance === 0) return currentPosition;

  const ratio = Math.min(stepSize / distance, 1);

  const newLat = lat1 + deltaLat * ratio;
  const newLon = lon1 + deltaLon * ratio;

  return [newLat, newLon];
}

function calculateEuclideanDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;
  return Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon);
}
