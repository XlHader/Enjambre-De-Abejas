# Visualización del Algoritmo de Colonia de Abejas (ABC)

Este proyecto es una aplicación web que visualiza el **Algoritmo de Colonia de Abejas Artificial (ABC)** aplicado al **Problema del Viajante de Comercio (TSP)**. Utiliza **React** y **TypeScript**, construido con **Vite**, y proporciona un mapa interactivo donde las abejas (agentes) exploran y optimizan rutas entre almacenes (ubicaciones).

## Tabla de Contenidos

- [Características](#características)
- [Demostración](#demostración)
- [Instalación](#instalación)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Agradecimientos](#agradecimientos)

## Características

- **Visualización Interactiva**: Observa en tiempo real cómo las abejas buscan y optimizan rutas.
- **Mapa Interactivo**: Utiliza Leaflet para mostrar los almacenes y el movimiento de las abejas.
- **Selección de Punto de Inicio**: Elige fácilmente el punto de partida directamente en el mapa.
- **Actualizaciones en Tiempo Real**: Visualiza cómo las abejas actualizan sus posiciones y cómo la ruta óptima mejora con cada iteración.
- **Panel de Control Intuitivo**: Controla el algoritmo, observa las estadísticas y comprende el comportamiento de las abejas.

## Demostración

Puedes ver una demostración en vivo de la aplicación [aquí](https://xlhader.github.io/Enjambre-De-Abejas/).

## Instalación

Sigue estos pasos para ejecutar el proyecto localmente:

1. **Clona el repositorio**:

   ```bash
   git clone https://github.com/XlHader/Enjambre-De-Abejas.git
   cd Enjambre-De-Abejas
   ```

2. **Instala las dependencias**:

   Asegúrate de tener [Node.js](https://nodejs.org/) y [npm](https://www.npmjs.com/) instalados en tu sistema.

   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**:

   ```bash
   npm run dev
   ```

4. **Abre la aplicación**:

   Abre tu navegador y navega a `http://localhost:5173/` (o la URL proporcionada en la consola).

## Uso

- **Seleccionar Punto de Inicio**: Haz clic en el mapa para establecer el punto de partida del algoritmo.
- **Panel de Control**:
  - **Iniciar/Pausar**: Comienza o detén temporalmente la ejecución del algoritmo.
  - **Reiniciar**: Restablece el algoritmo para comenzar desde cero.
- **Visualización**:
  - Las abejas aparecerán en el mapa, moviéndose según sus roles:
    - **Abejas Empleadas** (amarillo): Buscan soluciones y exploran rutas.
    - **Abejas Observadoras** (azul): Observan y aprovechan las soluciones de las abejas empleadas.
    - **Abejas Exploradoras** (naranja): Exploran nuevas áreas aleatoriamente.
  - La **mejor ruta** encontrada se mostrará en el mapa como una línea azul que conecta los almacenes.
- **Información Adicional**:
  - **Iteración Actual**: Observa el progreso del algoritmo.
  - **Mejor Distancia**: Conoce la distancia de la ruta óptima encontrada hasta el momento.
  - **Leyenda**: Identifica fácilmente los diferentes tipos de abejas en el mapa.

## Estructura del Proyecto

```
index.html
|-- src
    |-- App.tsx
    |-- main.tsx
    |-- index.css
    |-- components
        |-- Map.tsx
    |-- data
        |-- warehouses.ts
    |-- utils
        |-- beeColony.ts
    |-- types.ts
|-- package.json
|-- tsconfig.json
|-- vite.config.ts
|-- ...otros archivos y configuraciones
```

- **index.html**: Archivo HTML principal de la aplicación.
- **src**: Carpeta que contiene el código fuente.
  - **App.tsx**: Componente raíz de React.
  - **main.tsx**: Punto de entrada principal para React.
  - **index.css**: Estilos globales de la aplicación.
  - **components**: Componentes reutilizables de React.
    - **Map.tsx**: Componente que maneja el mapa y la visualización del algoritmo.
  - **data**:
    - **warehouses.ts**: Datos de los almacenes utilizados en el mapa.
  - **utils**:
    - **beeColony.ts**: Implementación del algoritmo de Colonia de Abejas Artificial.
  - **types.ts**: Definiciones de tipos e interfaces para TypeScript.
- **package.json**: Dependencias y scripts del proyecto.
- **tsconfig.json**: Configuración del compilador de TypeScript.
- **vite.config.ts**: Configuración de Vite para el proyecto.

## Tecnologías Utilizadas

- **React**: Biblioteca para construir interfaces de usuario interactivas.
- **TypeScript**: Superconjunto tipado de JavaScript que mejora la robustez del código.
- **Vite**: Herramienta de desarrollo y construcción rápida para aplicaciones web modernas.
- **Leaflet**: Biblioteca de código abierto para mapas interactivos.
- **React Leaflet**: Envoltorio de React para utilizar Leaflet de manera sencilla.
- **Lucide React**: Conjunto de iconos para interfaces de usuario.

## Agradecimientos

- **OpenStreetMap**: Por proporcionar datos de mapas y capas utilizadas en la aplicación.
- **Comunidad de Desarrollo**: Por las herramientas y bibliotecas de código abierto que hacen posible este proyecto.
