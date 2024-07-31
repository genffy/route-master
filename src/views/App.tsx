import MapEditor from "@/components/core/map-editor";
import FileList from "@/components/core/file-list";
import { useState } from "react";

export default function App() {
  const [routes, setRoutes] = useState<any>([]);
  function onLoadHandler(geojson: any) {
    setRoutes(geojson);
  }
  return (
    <main className="min-h-screen w-full">
      <FileList onLoaded={onLoadHandler}></FileList>
      <MapEditor routes={routes}></MapEditor>
    </main>
  );
}
