import MapEditor from "@/components/map-editor";
import FileList from "@/components/file-list";

export default async function Index() {

  return (
    <main className="min-h-screen w-full">
      <FileList></FileList>
      <MapEditor routes={[]}></MapEditor>
    </main>
  );
}
