// https://developer.garmin.com/fit/example-projects/javascript/
import { Decoder, Stream } from '@garmin-fit/sdk';

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
  return messages
}
