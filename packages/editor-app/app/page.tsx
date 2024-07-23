'use client';

import MapEditor from "@/components/map-editor";
import FileList from "@/components/file-list";
import { useState } from "react";

export default function Index() {
  const [routes, setRoutes] = useState<any>([]);
  function onLoadHandler(geojson: any) {
    console.log('onLoadHandler', geojson);
    setRoutes(geojson);
  }
  return (
    <main className="min-h-screen w-full">
      <FileList onLoaded={onLoadHandler}></FileList>
      <MapEditor routes={routes}></MapEditor>
    </main>
  );
}
