import styles from "./MapViewer.module.css";
import { useContext, useEffect, useRef } from "react";
import * as mapbox from "../../services/mapbox";
import { useLocation } from "react-router-dom";
import { pathToSection, toRadians } from "../../utils/utils";
import { CameraContext, CameraState } from "../../context/CameraContext";
import { ViewerContext } from "../../context/ViewerContext";
import { mapSections } from "../../constants/mapConstants";
import { Section } from "../../constants/surveyConstants";
import useEffectAfterMount from "../../hooks/useEffectAfterMount";

/**
 * Mapbox map viewer component.
 */
export default function MapViewer() {
  const { mapViewer, setMapViewer, setParentLayer, setColor, mapMode } =
    useContext(ViewerContext);
  const { cameraState, setCameraState } = useContext(CameraContext);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Create a map instance on component mount.
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const temp = mapbox.createMap(mapContainerRef.current.id);
    temp.on("load", () => {
      setMapViewer(temp);

      // Assign initial fov of the mapbox camera.
      const fov = toRadians(temp.transform.fov); // in radians
      const fovY = temp.transform.fovY; // in radians
      const fovRatio = fov / fovY;
      setCameraState((prev) => {
        return { ...prev, fov, fovY, fovRatio } as CameraState;
      });
    });

    return () => {
      mapViewer && mapbox.removeMap(mapViewer);
      setMapViewer(undefined);
    };
  }, []);

  if (mapContainerRef.current) {
    mapContainerRef.current!.addEventListener("click", () => {
      if (mapViewer) {
        const transform = mapViewer.transform;
        const matrix = transform.projMatrix;
        console.log({
          matrix: matrix,
          fov: transform.fov, // in degrees
          fovY: (transform.fovY * 180) / Math.PI,
          fovX: (transform.fovX * 180) / Math.PI,
          aspectRatio: transform.width / transform.height,
          projection: transform.projection,
        });
      }
    });
  }

  // useEffectAfterMount(() => {
  //   console.log("center: ", `${mapViewer!.getCenter().lat}, ${mapViewer!.getCenter().lng}`);
  // }, [cameraState])

  // Update the camera state when the map ends moving.
  useEffectAfterMount(() => {
    if (!mapViewer) return;

    const onMoveEnd = () => {
      const center = mapViewer.getCenter();
      setCameraState((prev) => {
        return {
          ...prev,
          center: [center.lng, center.lat],
          zoom: mapViewer.getZoom(),
          bearing: mapViewer.getBearing(),
          pitch: mapViewer.getPitch(),
        } as CameraState;
      });
    };
    const onResize = () => {
      const fov = toRadians(mapViewer.transform.fov); // in radians
      const fovY = mapViewer.transform.fovY; // in radians
      const fovRatio = fov / fovY;
      setCameraState((prev) => {
        return { ...prev, fov, fovY, fovRatio } as CameraState;
      });
    };
    mapViewer.on("moveend", onMoveEnd);
    window.addEventListener("resize", onResize);

    return () => {
      mapViewer.off("moveend", onMoveEnd);
      window.removeEventListener("resize", onResize);
    };
  }, [mapViewer, setCameraState]);

  useEffectAfterMount(() => {
    if (!mapViewer) return;

    // Update the map layers of the current page.
    const section: Section = pathToSection(location.pathname);
    mapbox.setLayers(section, mapViewer);

    // Update the map parent layer and color of the current page.
    const mapSection = mapSections.find((sec) => sec.id === section)!;
    setParentLayer(mapSection.parentLayer);
    setColor(mapSection.color);

    return () => {
      setParentLayer("");
      setColor(undefined);
    };
  }, [location.pathname, mapViewer, setColor, setParentLayer]);

  // Resize the map when its display mode changes.
  useEffectAfterMount(() => {
    if (!mapViewer) return;
    mapViewer.resize();
  }, [mapMode, mapViewer]);

  return (
    <div
      id="map"
      ref={mapContainerRef}
      className={styles.map}
      style={{
        display: mapMode == "map" ? "block" : "none",
      }}
    ></div>
  );
}
