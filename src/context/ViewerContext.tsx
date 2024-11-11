import { createContext, useEffect, useState } from "react";
import { Color } from "../constants/mapConstants";
import MapViewer from "../components/organisms/MapViewer";
import SatelliteViewer from "../components/organisms/SatelliteViewer";
import * as Cesium from "cesium";

export type MapMode = "satellite" | "map";

type ViewerContextProps = {
  mapViewer: mapboxgl.Map | undefined;
  setMapViewer: React.Dispatch<React.SetStateAction<mapboxgl.Map | undefined>>;
  satelliteViewer: Cesium.Viewer | undefined;
  setSatelliteViewer: React.Dispatch<
    React.SetStateAction<Cesium.Viewer | undefined>
  >;
  parentLayer: string;
  setParentLayer: React.Dispatch<React.SetStateAction<string>>;
  color: Color | undefined;
  setColor: React.Dispatch<React.SetStateAction<Color | undefined>>;
  mapMode: MapMode;
  toggleMapMode: () => void;
};

/**
 * Context that stores states of {@link SatelliteViewer} and {@link MapViewer}.
 */
export const ViewerContext = createContext<ViewerContextProps>(
  {} as ViewerContextProps
);

/**
 * Context provider that stores states of {@link SatelliteViewer} and {@link MapViewer}.
 */
export function ViewerContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mapViewer, setMapViewer] = useState<mapboxgl.Map>();
  const [satelliteViewer, setSatelliteViewer] = useState<Cesium.Viewer>();
  const [parentLayer, setParentLayer] = useState<string>("");
  const [color, setColor] = useState<Color>();
  const [mapMode, setMapMode] = useState<MapMode>(() => {
    // const savedMapMode = localStorage.getItem("mapMode") as MapMode;
    // return savedMapMode || "map";
    return "map";
  });

  useEffect(() => {
    document.documentElement.setAttribute("map-mode", mapMode);
    localStorage.setItem("mapMode", mapMode);
  }, [mapMode]);

  const toggleMapMode = () => {
    setMapMode((prevMode) => (prevMode === "satellite" ? "map" : "satellite"));
  };

  return (
    <ViewerContext.Provider
      value={{
        mapViewer,
        setMapViewer,
        satelliteViewer,
        setSatelliteViewer,
        parentLayer,
        setParentLayer,
        color,
        setColor,
        mapMode,
        toggleMapMode,
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
}
