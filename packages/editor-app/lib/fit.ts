import { Decoder, Stream } from '@garmin/fitsdk';
// TODO add FIT decode data types
export async function decoderFitFile(file: Blob) {
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
  return convertFitToGeojson(messages)
}


function convertFitToGeojson(data: any) {
  // typeof geoJSON
  let geo: any = {}
  geo.type = 'FeatureCollection'
  geo.features = []
  const recordMesgs = data && data.recordMesgs.filter((item: any) => item.positionLong && item.positionLat)
  if (recordMesgs) {
    let prev_position_long = 0
    let prev_position_lat = 0
    // TODO
    let element: any = {}
    // {
    //   "timestamp": "2022-10-05T04:35:24.000Z",
    //   "distance": 0.92,
    //   "altitude": 575.2,
    //   "speed": 0.924,
    //   "cycleLength16": 0,
    //   "heartRate": 100,
    //   "cadence": 42,
    //   "temperature": 27,
    //   "fractionalCadence": 0.5,
    //   "enhancedAltitude": 575.2,
    //   "enhancedSpeed": 0.924
    // }
    for (let idx_records = 0, len = recordMesgs.length; idx_records < len; idx_records++) {
      //   {
      //     "timestamp": "2022-10-05T04:37:05.000Z",
      //     "positionLat": 328535189,
      //     "positionLong": 1362131010,
      //     "distance": 59.58,
      //     "altitude": 578.5999999999999,
      //     "speed": 0,
      //     "cycleLength16": 0,
      //     "heartRate": 81,
      //     "cadence": 0,
      //     "temperature": 27,
      //     "fractionalCadence": 0,
      //     "enhancedAltitude": 578.5999999999999,
      //     "enhancedSpeed": 0
      // }
      element = recordMesgs[idx_records]

      if (idx_records > 0) {
        // TODO
        let f: any = {}
        f.type = 'Feature'
        f.properties = element
        f.geometry = {}
        f.geometry.type = 'LineString'
        f.geometry.coordinates = [
          [prev_position_long, prev_position_lat],
          [element.positionLong, element.positionLat],
        ]
        // f.geometry.coordinates = [element.positionLong, element.positionLat]
        geo.features.push(f)
      }
      prev_position_long = element.positionLong
      prev_position_lat = element.positionLat
    }
  }
  return geo;
}
