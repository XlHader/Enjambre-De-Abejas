import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import { Icon, DivIcon } from "leaflet";
import { warehouses } from "../data/warehouses";
import {
  initializeBeeColony,
  performBeeColonyIteration,
} from "../utils/beeColony";
import { Play, Pause, RotateCcw } from "lucide-react";
import { BeeColonyState } from "../types";

import "leaflet/dist/leaflet.css";

const warehouseIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const startIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const createBeeIcon = (type: "scout" | "onlooker" | "employed") => {
  const colors = {
    scout: "#FFA500",
    onlooker: "#4169E1",
    employed: "#FFD700",
  };

  return new DivIcon({
    html: `
      <div style="
        width: 10px;
        height: 10px;
        background-color: ${colors[type]};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
      "></div>
    `,
    className: "",
    iconSize: [10, 10],
  });
};

function MapClickHandler({
  onLocationSelect,
  disabled,
}: {
  onLocationSelect: (coords: [number, number]) => void;
  disabled: boolean;
}) {
  useMapEvents({
    click: (e) => {
      if (!disabled) {
        onLocationSelect([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

const MAX_ITERATIONS = 100;

export default function Map() {
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [colonyState, setColonyState] = useState<BeeColonyState | null>(null);
  const [bestDistance, setBestDistance] = useState<number | null>(null);
  const [bestFitness, setBestFitness] = useState<number | null>(null);
  const [finalPath, setFinalPath] = useState<number[]>([]);

  const handleLocationSelect = (coords: [number, number]) => {
    setStartPoint(coords);
    setIteration(0);
    setBestDistance(null);
    setBestFitness(null);
    setIsRunning(false);
    setColonyState(null);
    setFinalPath([]);
  };

  const startAlgorithm = () => {
    if (!startPoint) return;
    const initialState = initializeBeeColony(warehouses, startPoint);
    setColonyState(initialState);
    setIsRunning(true);
  };

  const resetAlgorithm = () => {
    setIteration(0);
    setBestDistance(null);
    setBestFitness(null);
    setIsRunning(false);
    setColonyState(null);
    setFinalPath([]);
  };

  useEffect(() => {
    if (!isRunning || !startPoint || !colonyState) return;

    if (iteration >= MAX_ITERATIONS) {
      setIsRunning(false);
      // Al finalizar, actualizamos la ruta final si existe una solución
      if (colonyState.bestSolution) {
        setFinalPath(colonyState.bestSolution.path);
        setBestDistance(colonyState.bestSolution.distance);
      }
      return;
    }

    const timeout = setTimeout(() => {
      const newState = performBeeColonyIteration(
        colonyState,
        warehouses,
        startPoint,
        iteration
      );

      setColonyState(newState);
      setIteration((prev) => prev + 1);

      // Actualiza el mejor fitness y distancia si se encuentra una mejor solución
      if (
        newState.bestSolution &&
        (bestFitness === null || newState.bestSolution.fitness > bestFitness)
      ) {
        setBestFitness(newState.bestSolution.fitness);
        setBestDistance(newState.bestSolution.distance);
      }

      // Si la mejora es pequeña durante varias iteraciones, se detiene el algoritmo
      if (iteration - newState.lastImprovementIteration > 20) {
        setIsRunning(false);
        if (newState.bestSolution) {
          setFinalPath(newState.bestSolution.path);
          setBestDistance(newState.bestSolution.distance);
        }
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [isRunning, colonyState, startPoint, iteration, bestFitness]);

  const pathCoordinates =
    startPoint && finalPath.length > 0
      ? [
          startPoint,
          ...finalPath.map((index) => warehouses[index].coordinates),
          startPoint,
        ]
      : [];

  return (
    <div className="h-screen flex">
      <MapContainer
        center={[4.6486, -74.0856]}
        zoom={14}
        className="h-full flex-1"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <MapClickHandler
          onLocationSelect={handleLocationSelect}
          disabled={isRunning}
        />

        {warehouses.map((warehouse, index) => (
          <Marker
            key={warehouse.name}
            position={warehouse.coordinates}
            icon={warehouseIcon}
          >
            <Popup>{warehouse.name}</Popup>
          </Marker>
        ))}

        {startPoint && (
          <Marker position={startPoint} icon={startIcon}>
            <Popup>Punto de inicio</Popup>
          </Marker>
        )}

        {pathCoordinates.length > 0 && (
          <Polyline positions={pathCoordinates} color="blue" weight={3} />
        )}

        {/* Mostrar abejas en el mapa */}
        {colonyState?.bees.map((bee, index) => (
          <Marker
            key={`bee-${index}`}
            position={bee.currentPosition}
            icon={createBeeIcon(bee.type)}
          >
            <Popup>
              {bee.type.charAt(0).toUpperCase() + bee.type.slice(1)} {index + 1}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="w-80 bg-white p-4 shadow-lg overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Panel de Control</h2>

        {!startPoint ? (
          <p className="text-gray-600 mb-4">
            Haz clic en el mapa para seleccionar el punto de inicio
          </p>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  if (isRunning) {
                    setIsRunning(false);
                  } else {
                    startAlgorithm();
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded ${
                  isRunning
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                } text-white`}
              >
                {isRunning ? (
                  <>
                    <Pause size={16} /> Pausar
                  </>
                ) : (
                  <>
                    <Play size={16} /> Iniciar
                  </>
                )}
              </button>

              <button
                onClick={resetAlgorithm}
                className="flex items-center gap-2 px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
              >
                <RotateCcw size={16} /> Reiniciar
              </button>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">
                Iteración: {iteration}/{MAX_ITERATIONS}
              </p>
              {bestDistance !== null && (
                <p className="font-semibold">
                  Mejor distancia: {bestDistance.toFixed(2)} km
                </p>
              )}
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Leyenda:</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FFD700]"></div>
                    <span>Abejas Empleadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#4169E1]"></div>
                    <span>Abejas Observadoras</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FFA500]"></div>
                    <span>Abejas Exploradoras</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
