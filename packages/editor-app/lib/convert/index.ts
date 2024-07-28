import { Decoder, Stream } from '@garmin/fitsdk';
import toGeoJSON from '@mapbox/togeojson';

import type { FeatureCollection, Feature, LineString } from 'geojson';

export async function decodeFile(file: Blob): Promise<FeatureCollection<LineString>> {
  // detect file type
  const fileType = file.type || file.name.split('.').pop();
  const buffer = Buffer.from(await file.arrayBuffer());
  console.log('fileType', fileType)
  let geo: FeatureCollection<LineString> = {
    type: 'FeatureCollection',
    features: [],
  }
  switch (fileType) {
    case 'fit':
      const messages = decoderFitFile(buffer);
      geo.features = [convertFitToGeojson(messages)];
      break;
    case 'gpx':
      return decodeGpxFile(buffer);
  }
  return geo;
}

function decodeGpxFile(buffer: Buffer): Promise<FeatureCollection<LineString>> {
  const gpxData = (new DOMParser()).parseFromString(buffer.toString(), 'text/xml')
  const geoJSON = toGeoJSON.gpx(gpxData);
  return geoJSON;
}

function decoderFitFile(buffer: Buffer) {
  const stream = Stream.fromBuffer(buffer);
  console.log("isFIT (static method): " + Decoder.isFIT(stream));
  const decoder = new Decoder(stream);
  console.log("isFIT (instance method): " + decoder.isFIT());
  console.log("checkIntegrity: " + decoder.checkIntegrity());

  const { messages, errors } = decoder.read();
  if (!errors && errors.length > 0) {
    console.log(errors);
    return {}
  }

  return messages;
}

const SEMICIRCLE = 11930465;
function convertFitToGeojson(data: any): Feature<LineString> {
  // typeof geoJSON
  const recordMesgs = data && data.recordMesgs.filter((item: any) => item.positionLong != undefined && item.positionLat != undefined)
  const feature: Feature<LineString> = {
    type: 'Feature',
    properties: {},
    geometry: {
      coordinates: [],
      type: 'LineString'
    }
  }
  recordMesgs.forEach((item: any) => {
    feature.geometry.coordinates.push([
      item.positionLong / SEMICIRCLE,
      item.positionLat / SEMICIRCLE
    ])
  });
  return feature;
}
