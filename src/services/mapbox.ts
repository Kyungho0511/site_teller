import { KMeansLayer } from "./kmeans";
import mapboxgl from "mapbox-gl";
import {
  Color,
  configs,
  MapBound,
  MapLayer,
  mapSections,
} from "../constants/mapConstants";
import { ClusterList, Section } from "../constants/surveyConstants";
import * as utils from "../utils/utils";
import { HealthcarePropertyName } from "../constants/geoJsonConstants";

/**
 * Create a mapbox map instance.
 */
export function createMap(mapContainerId: string): mapboxgl.Map {
  mapboxgl.accessToken = import.meta.env.VITE_API_KEY_MAPBOX as string;
  const bounds: mapboxgl.LngLatBoundsLike = [
    [-85, 36], // Southwest coordinates
    [-65, 48], // Northeast coordinates
  ];
  const [longitude, latitude] = configs.location.center;

  const map = new mapboxgl.Map({
    container: mapContainerId,
    style: configs.style,
    center: [longitude, latitude],
    zoom: configs.location.zoom,
    bearing: configs.location.bearing,
    pitch: configs.location.pitch,
    scrollZoom: true,
    maxBounds: bounds,
    attributionControl: false,
    logoPosition: "top-left",
    projection: "globe",
  });
  map.transform.fov = configs.camera.fov;

  return map;
}

/**
 * Remove the mapbox map instance.
 * @param map Map to remove.
 */
export function removeMap(map: mapboxgl.Map): void {
  map.remove();
}

/**
 * Get the paint type of the mapbox layer.
 */
export function getLayerPaintType(
  layer: MapLayer,
  map: mapboxgl.Map
): string[] | undefined {
  // Exit if the layer type is not found.
  const layerType = map.getLayer(layer.name)?.type;
  if (!layerType) return;

  switch (layerType) {
    case "fill":
      return ["fill-opacity"];
    case "line":
      return ["line-opacity"];
    case "circle":
      return ["circle-opacity", "circle-stroke-opacity"];
    case "symbol":
      return ["icon-opacity", "text-opacity"];
    case "raster":
      return ["raster-opacity"];
    case "background":
      return ["background-opacity"];
    case "fill-extrusion":
      return ["fill-extrusion-opacity"];
    default:
      return;
  }
}

/**
 * Set the opacity of the mapbox layer.
 * @param layer mapbox layer to set opacity.
 * @param map Map in which layer opacity is set.
 */
export function setLayerOpacity(layer: MapLayer, map: mapboxgl.Map): void {
  const paintProps: string[] | undefined = getLayerPaintType(layer, map);
  paintProps &&
    paintProps.forEach(function (prop) {
      map.setPaintProperty(layer.name, prop, layer.opacity);
    });
}

/**
 * Turn on layers based on the section.
 * @param section Each url path corresponds to a section.
 * @param map Map in which layers are set.
 */
export function setLayers(section: Section, map: mapboxgl.Map): void {
  // Exit if the section is not found.
  const mapSection = mapSections.find((sec) => sec.id === section);
  if (!mapSection) return;

  // Update layer opacity.
  offLayers(map);
  mapSection.layers.forEach((layer) => setLayerOpacity(layer, map));

  // Home: Update layer style, adjusting the color interpolation.
  if (section === "home") {
    const name = mapSection.attribute!.name;
    updateLayerAttribute(mapSection.parentLayer!, name, mapSection.color!, map);
  }
}

/**
 * Update attribute of the mapbox layer to be drawn.
 */
export function updateLayerAttribute(
  layer: string,
  attribute: HealthcarePropertyName,
  color: Color,
  map: mapboxgl.Map
) {
  const bound: MapBound = utils.getBound(attribute)!;
  map.setPaintProperty(layer, "fill-color", [
    "interpolate",
    bound.rateOfChange,
    ["get", attribute],
    bound.min,
    color.min,
    bound.max,
    color.max,
  ]);
}

/**
 * Update a k-means cluster layer color style on the mapbox map.
 * @param clusterList Informs which clusters are selected.
 * @param map Map to which the layer is updated.
 */
export function updateClusterLayer(
  clusterList: ClusterList,
  map?: mapboxgl.Map
) {
  if (map && map.getLayer(clusterList.name)) {
    const list = clusterList.list;
    map.setPaintProperty(clusterList.name, "fill-color", [
      "case",
      ["==", ["get", "cluster"], 0],
      list[0].checked ? list[0].color : "#ffffff",
      ["==", ["get", "cluster"], 1],
      list[1].checked ? list[1].color : "#ffffff",
      ["==", ["get", "cluster"], 2],
      list[2].checked ? list[2].color : "#ffffff",
      ["==", ["get", "cluster"], 3],
      list[3].checked ? list[3].color : "#ffffff",
      "#ffffff",
    ]);
  }
}

/**
 * Add a k-means cluster layer to the mapbox map.
 * @param kMeansLayer Layer to be added.
 * @param map Map to which the layer is added.
 * @param color If true, the layer is colored.
 */
export function addClusterLayer(
  kMeansLayer: KMeansLayer,
  map: mapboxgl.Map,
  color?: boolean
) {
  map.addSource(kMeansLayer.title, {
    type: "geojson",
    data: kMeansLayer.geoJson,
  });

  map.addLayer(
    {
      id: kMeansLayer.title,
      type: "fill",
      source: kMeansLayer.title,
      paint: {
        "fill-color": [
          "case",
          ["==", ["get", "cluster"], 0],
          color ? kMeansLayer.colors[0] : "#ffffff",
          ["==", ["get", "cluster"], 1],
          color ? kMeansLayer.colors[1] : "#ffffff",
          ["==", ["get", "cluster"], 2],
          color ? kMeansLayer.colors[2] : "#ffffff",
          ["==", ["get", "cluster"], 3],
          color ? kMeansLayer.colors[3] : "#ffffff",
          "#ffffff",
        ],
        "fill-opacity": 1,
        "fill-outline-color": "rgba(217, 217, 217, 0.36)",
      },
    },
    "road-simple"
  );
}
/**
 * Remove a k-means cluster layer from the mapbox map.
 * @param kMeansLayer Layer to be removed.
 * @param map Map from which the layer is removed.
 */
export function removeClusterLayer(
  kMeansLayer: KMeansLayer,
  map: mapboxgl.Map
) {
  if (map.getLayer(kMeansLayer.title)) {
    map.removeLayer(kMeansLayer.title);
    map.removeSource(kMeansLayer.title);
  }
}
/**
 * Remove all k-means cluster layers from the mapbox map.
 * @param kMeansLayers Layers to be removed.
 * @param map Map from which the layers are removed.
 */
export function removeAllClusterLayers(
  kMeansLayers: KMeansLayer[],
  map: mapboxgl.Map
) {
  kMeansLayers.forEach((kMeansLayer) => {
    removeClusterLayer(kMeansLayer, map);
  });
}

/**
 * Turn off all layers by setting opacity to 0.
 * @param map Map in which the layers are turned off.
 */
export function offLayers(map: mapboxgl.Map) {
  mapSections.forEach((sec) => {
    sec.layers.forEach((layer) => {
      setLayerOpacity({ name: layer.name, opacity: 0 }, map);
    });
  });
}

/**
 * Set the line weight of the selected feature.
 * @param layer Name of the layer.
 * @param keyId Name of the layer property id.
 * @param valueId Value of layer property id to compare.
 * @param lineWeight Line weight of the outline.
 */
export function setLineWidth(
  layer: string,
  keyId: string,
  valueId: number,
  lineWeight: number,
  map: mapboxgl.Map
) {
  map.setPaintProperty(layer, "line-width", [
    "case",
    ["==", ["get", keyId], valueId],
    lineWeight,
    0,
  ]);
}

/**
 * Hide the line width of the mapbox layer.
 * @param layer Name of the layer to hide.
 */
export function hideLineWidth(layer: string, map: mapboxgl.Map) {
  map.setPaintProperty(layer, "line-width", 0);
}
