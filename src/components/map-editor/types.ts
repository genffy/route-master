import { FeatureCollection } from "geojson";

export interface ExtendFeatureCollection extends FeatureCollection {
  properties?: { id: string, name: string, active: boolean }
}
