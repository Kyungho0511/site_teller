import { useEffect, useState } from "react";
import { HealthcareFeatureCollection } from "../constants/geoJsonConstants";

/**
 * Custom hook to fetch geoJson data from the file path.
 * @param filePath File path of the geoJson data
 */
export default function useGeoJson(filePath: string) {
  const [loadingGeoJson, setLoadingGeoJson] = useState<boolean>(true);
  const [errorGeoJson, setErrorGeoJson] = useState<string | undefined>();
  const [geoJson, setGeoJson] = useState<
    HealthcareFeatureCollection | undefined
  >();

  useEffect(() => {
    setLoadingGeoJson(true);
    setErrorGeoJson(undefined);
    if (!geoJson) {
      const fetchData = async () => {
        try {
          const response = await fetch(filePath);
          const data = await response.json();
          setGeoJson(data);
        } catch {
          const errorMessage = "Failed to fetch GeoJson data";
          setErrorGeoJson(errorMessage);
          console.error(errorMessage);
        } finally {
          setLoadingGeoJson(false);
        }
      };
      fetchData();
    }
  }, []);

  return [loadingGeoJson, errorGeoJson, geoJson, setGeoJson] as const;
}
