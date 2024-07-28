
import { decodeFile } from '@/lib/convert';

export async function POST(request: Request) {
  const file = await request.formData()
  const fileData = await file.get('file') as Blob | null;
  if (!fileData) {
    return new Response(
      "File blob is required.",
      { status: 400 }
    );
  }
  const messages = decodeFile(fileData);

  console.log(messages);
  return new Response(JSON.stringify(messages), { status: 200 })
}
