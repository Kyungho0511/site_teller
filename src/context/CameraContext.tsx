import React, { createContext, useContext, useState } from "react";
import * as Cesium from "cesium";
import { configs } from "../constants/mapConstants";
import { ViewerContext } from "./ViewerContext";

/**
 * Camera state in cartographic coordinates.
 * @property fov: radian value of the field of view.
 * @property fovRatio: Ratio of fov to fovY from the mapbox camera. It's used to sync cameras of the map and satellite viewers.
 */
export type CameraState = {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
  fov: number;
  fovY?: number;
  fovModifier?: number;
};

type CameraContextProps = {
  cameraState: CameraState;
  setCameraState: React.Dispatch<React.SetStateAction<CameraState>>;
  syncMapCamera: (cameraState: CameraState) => void;
  syncSatelliteCamera: (cameraState: CameraState) => void;
};

/**
 * Context that stores the camera state in cartographic coordinates.
 */
export const CameraContext = createContext<CameraContextProps>(
  {} as CameraContextProps
);

/**
 * Context provider that stores the camera state in cartographic coordinates.
 */
export function CameraContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mapViewer, satelliteViewer } = useContext(ViewerContext);
  const [cameraState, setCameraState] = useState<CameraState>({
    center: configs.location.center as [number, number],
    zoom: configs.location.zoom,
    bearing: configs.location.bearing,
    pitch: configs.location.pitch,
    fov: configs.camera.fov,
  });

  const syncMapCamera = (cameraState: CameraState) => {
    if (!mapViewer) return;

    mapViewer.jumpTo({
      center: cameraState.center,
      zoom: cameraState.zoom,
      bearing: cameraState.bearing,
      pitch: cameraState.pitch,
    });
  };

  const syncSatelliteCamera = (cameraState: CameraState) => {
    if (!satelliteViewer) return;
    const { center, zoom, bearing, pitch, fov, fovY, fovModifier } =
      cameraState;

    // Calculate altitude based on zoom level using Web Mercator relationship
    const earthCircumference = 40075016.686; // in meters
    // At zoom level 0, one tile covers half the earth
    const metersPerPixel =
      (earthCircumference * Math.cos(Cesium.Math.toRadians(center[1]))) /
      (256 * Math.pow(2, zoom));
    // Apply modifier to fine-tune the zoom level
    const modifier = 2.4;
    const altitude = metersPerPixel * 256 * modifier;

    const cartographic = new Cesium.Cartographic(
      Cesium.Math.toRadians(center[0]), // longitude
      Cesium.Math.toRadians(center[1]), // latitude
      altitude
    );

    satelliteViewer.camera.setView({
      destination: Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic),
      orientation: {
        heading: Cesium.Math.toRadians(bearing),
        pitch: Cesium.Math.toRadians(pitch - 90),
        roll: 0,
      },
    });

    // Satellite viewer keeps the same ground coverage in X direction, whereas
    // the map viewer does not. So, we need to adjust the fov of the satellite viewer.
    if (!fovModifier || !fovY) return;
    const frustum = satelliteViewer.camera.frustum as Cesium.PerspectiveFrustum;
    const fovRatio = fov / fovY;
    frustum.fov = fovRatio >= 1 ? fovRatio * fovModifier * fov : fov;

    // console.log(fovRatio);
  };

  return (
    <CameraContext.Provider
      value={{
        cameraState,
        setCameraState,
        syncMapCamera,
        syncSatelliteCamera,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
}
