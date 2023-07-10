// https://developer.garmin.com/fit/example-projects/javascript/
import { Decoder, Stream, Profile, Utils } from '@garmin-fit/sdk';

export async function POST(request: Request) {

  // get file from request
  const file = await request.formData()

  const fileData = await file.get('file')
  // TODO convert to ArrayBuffer

  const bytes = [0x0E, 0x10, 0xD9, 0x07, 0x00, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54, 0x91, 0x33, 0x00, 0x00];

  const stream = Stream.fromByteArray(bytes);
  console.log("isFIT (static method): " + Decoder.isFIT(stream));

  const decoder = new Decoder(stream);
  console.log("isFIT (instance method): " + decoder.isFIT());
  console.log("checkIntegrity: " + decoder.checkIntegrity());

  const { messages, errors } = decoder.read();

  console.log(errors);
  console.log(messages);
  return new Response(JSON.stringify({}), { status: 200 })
}
