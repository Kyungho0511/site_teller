import styles from "./SatelliteViewer.module.css";
import * as Cesium from "cesium";
import { useContext, useEffect, useRef } from "react";
import { CameraContext } from "../../context/CameraContext";
import { ViewerContext } from "../../context/ViewerContext";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { GOOGLE_3D_TILES_ID } from "../../constants/3DTilesConstants";
import useEffectAfterMount from "../../hooks/useEffectAfterMount";
import { configs } from "../../constants/mapConstants";

/**
 * Cesium satellite viewer component.
 */
export default function SatelliteViewer() {
  const { mapMode, mapViewer, satelliteViewer, setSatelliteViewer } =
    useContext(ViewerContext);
  const { cameraState, syncSatelliteCamera } = useContext(CameraContext);

  const satelliteContainerRef = useRef<HTMLDivElement>(null);
  const satelliteViewerRef = useRef<Cesium.Viewer>();

  // Initialize the Cesium viewer.
  useEffect(() => {
    if (!satelliteContainerRef.current) return;
    const initializeCesium = async () => {
      Cesium.Ion.defaultAccessToken = import.meta.env
        .VITE_API_KEY_CESIUM as string;
      satelliteViewerRef.current = new Cesium.Viewer(
        satelliteContainerRef.current as Element,
        {
          skyAtmosphere: new Cesium.SkyAtmosphere(),
          scene3DOnly: true,
          globe: false,
          sceneModePicker: false,
          selectionIndicator: false,
          baseLayerPicker: false,
          animation: false,
          timeline: false,
          navigationHelpButton: false,
          infoBox: false,
          geocoder: false,
          fullscreenButton: false,
          homeButton: false,
          vrButton: false,
          targetFrameRate: 60,
          showRenderLoopErrors: false,
        }
      );
      const viewer = satelliteViewerRef.current;
      setSatelliteViewer(viewer);
      viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;

      try {
        const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(
          GOOGLE_3D_TILES_ID
        );
        viewer.scene.primitives.add(tileset);
      } catch (error) {
        console.error(error);
      }

      // Math FOV of the satellite viewer to the map viewer's fov.
      const frustum = viewer.camera.frustum as Cesium.PerspectiveFrustum;
      frustum.fov = Cesium.Math.toRadians(configs.camera.fov);

      viewer.resize();
      viewer.render();
    };

    initializeCesium();

    return () => {
      if (satelliteViewerRef.current) {
        satelliteViewerRef.current.destroy();
      }
    };
  }, []);

  // Initial sync of the fov of the satellite viewer to the map viewer's fov.
  useEffectAfterMount(() => {}, [mapViewer]);

  // // Update the camera state when the map ends moving.
  // useEffectAfterMount(() => {
  //   if (!satelliteViewer) return;

  //   const onMoveEnd = () => {
  //     const cartographic = satelliteViewer.camera.positionCartographic;
  //     setCameraState({
  //       center: [cartographic.longitude, cartographic.latitude],
  //       zoom: Math.log2(40075016.686 / cartographic.height) - 1,
  //       bearing: satelliteViewer.camera.heading,
  //       pitch: satelliteViewer.camera.pitch,
  //     } as CameraState);
  //   }
  //   satelliteViewer.camera.moveEnd.addEventListener(onMoveEnd);

  //   return () => {
  //     satelliteViewer.camera.moveEnd.removeEventListener(onMoveEnd);
  //   }
  // }, [satelliteViewer, setCameraState]);

  if (satelliteContainerRef.current) {
    satelliteContainerRef.current!.addEventListener("click", () => {
      if (!satelliteViewer) return;

      // Log camera frustum parameters
      const frustum = satelliteViewer.camera
        .frustum as Cesium.PerspectiveFrustum;
      console.log("Frustum:", {
        fovy: Cesium.Math.toDegrees(frustum.fovy!),
        fov: Cesium.Math.toDegrees(frustum.fov!),
        fovRatio: frustum.fov! / frustum.fovy!,
        aspectRatio: frustum.aspectRatio,
        matrix: frustum.projectionMatrix,
      });
    });
  }

  // useEffectAfterMount(() => {
  //   const cartographic = satelliteViewer!.camera.positionCartographic;
  //   console.log(satelliteViewer!.canvas.clientHeight);
  //   console.log(
  //     "center: ",
  //     `${Cesium.Math.toDegrees(cartographic.latitude)}, ${Cesium.Math.toDegrees(
  //       cartographic.longitude
  //     )}`
  //   );
  // }, [cameraState]);

  // Sync the camera states between map and satellite viewers.
  useEffectAfterMount(() => {
    if (!satelliteViewer) return;
    syncSatelliteCamera(cameraState);
  }, [cameraState]);

  return (
    <div
      ref={satelliteContainerRef}
      className={styles.container}
      style={{
        display: mapMode == "satellite" ? "block" : "none",
      }}
    ></div>
  );
}
