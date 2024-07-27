'use client';

import MapEditor from "@/components/map-editor";
import FileList from "@/components/file-list";
import { useEffect, useState } from "react";
import sampleData from '@/mock/samlpe.json';

export default function Index() {
  const [routes, setRoutes] = useState<any>([]);
  function onLoadHandler(geojson: any) {
    setRoutes(geojson);
  }
  useEffect(() => {
    setTimeout(() => {
      setRoutes([sampleData]);
    }, 1000);
  }, []);
  return (
    <main className="min-h-screen w-full">
      <FileList onLoaded={onLoadHandler}></FileList>
      <MapEditor routes={routes}></MapEditor>
    </main>
  );
}
