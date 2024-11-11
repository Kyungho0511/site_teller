import { HealthcarePropertyName } from "../constants/geoJsonConstants";
import { Section } from "../constants/surveyConstants";
import {
  FillColor,
  MapBound,
  UnitType,
  mapAttributes,
} from "../constants/mapConstants";

/**
 * Returns the section name corresponding to the path.
 * @param path Url path name.
 */
export function pathToSection(path: string): Section {
  if (path === "/") {
    return "home";
  }
  const clusterMatch = path.match(/^\/cluster\/(\d+)$/);
  if (clusterMatch) {
    return `cluster${clusterMatch[1]}` as Section;
  }
  return "home";
}

/**
 * Get the bound corresponding to the attribute name.
 * @param attribute name of the attribute in search for the bound.
 */
export function getBound(attribute: HealthcarePropertyName): MapBound {
  return mapAttributes.find((attr) => attr.name === attribute)!.bound;
}

/**
 * Get the unit type corresponding to the attribute name.
 * @param attribute name of the attribute in search for the unit type.
 */
export function getUnit(
  attribute: HealthcarePropertyName
): UnitType | undefined {
  return mapAttributes.find((attr) => attr.name === attribute)?.unit;
}

/**
 * Format the number based on the unit type.
 * @param num number to be formatted.
 * @param unit unit type to be used for formatting.
 */
export function formatUnit(num: number, unit: UnitType): string {
  switch (unit) {
    case "population density":
      return `${Math.round(num / 100) / 10}k`;
    case "percentage":
      return `${Math.round(num)}%`;
    case "percentage * 100":
      return `${Math.round(num * 100)}%`;
    case "dollar":
      return `$ ${Math.round(num).toLocaleString("en-US")}`;
    case "dollar * 50":
      return `$ ${Math.round(num * 50).toLocaleString("en-US")}`;
    default:
      return `${Math.round(num)}`;
  }
}

/**
 * Restore original value of the normalized number(0-1)
 * @param value value to be restored.
 * @param bound bound of the original value.
 */
export function unNormalize(value: number, bound: MapBound): number {
  return (bound.max - bound.min) * value;
}

/**
 * Get the series of numbers from 1 to value.
 * @param count number of series to be generated.
 */
export function getSeriesNumber(count: number) {
  const series = [];
  for (let i = 1; i < count + 1; i++) {
    series.push(i);
  }
  return series;
}

/**
 * Parse characters from the string.
 * @param value value to be parsed.
 */
export function parseString(value: string): string {
  return value.match(/[a-zA-Z]+/)![0];
}

/**
 * Check if the fill color is white.
 * @param fillColor Fill color to check.
 */
export function isWhiteFillColor(fillColor: FillColor): boolean {
  return (
    fillColor.r == 1 && fillColor.g == 1 && fillColor.b == 1 && fillColor.a == 1
  );
}

/**
 * Convert degrees to radians.
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
