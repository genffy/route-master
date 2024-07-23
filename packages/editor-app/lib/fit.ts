import { Decoder, Stream } from '@garmin/fitsdk';
// TODO add FIT decode data types
export async function decoderFitFile(file: Blob) {
  console.log('file', file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
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
  const geo: any = {
    type: 'FeatureCollection',
    properties: {
      id: btoa(file.name),
      name: file.name
    },
    features: []
  }
  geo.features = convertFitToGeojson(messages)
  return geo;
}

const SEMICIRCLE = 11930465;
export function convertFitToGeojson(data: any) {
  // typeof geoJSON
  const features = []
  const recordMesgs = data && data.recordMesgs.filter((item: any) => item.positionLong != undefined && item.positionLat != undefined)
  const feature = {
    type: 'Feature',
    properties: {},
    geometry: {
      coordinates: [] as any,
      type: 'LineString'
    }
  }
  recordMesgs.forEach((item: any) => {
    feature.geometry.coordinates.push([
      item.positionLong / SEMICIRCLE,
      item.positionLat / SEMICIRCLE
    ])
  });
  features.push(feature)
  return features;
}
