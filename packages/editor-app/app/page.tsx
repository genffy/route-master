'use client';

import MapEditor from "@/components/map-editor";
import FileList from "@/components/file-list";
import { useState } from "react";
import mockRouteSingle from '@/mock/routes-single.json'

export default function Index() {
  const [routes, setRoutes] = useState([]);
  const [activeFiles, setActiveFiles] = useState<any[]>([]);
  function onLoadHandler(files: File[], actives: any[]) {
    setActiveFiles(actives);
  }
  return (
    <main className="min-h-screen w-full">
      <FileList onLoaded={onLoadHandler}></FileList>
      <MapEditor routes={routes} geoJSON={mockRouteSingle}></MapEditor>
    </main>
  );
}
