'use client';

import React, { useState } from 'react'

import FileList from '@/components/shared/FileList'
import MapEditor, { type Route } from '@/components/shared/MapEditor';
import { decoderFitFile } from '@/lib/fit';

export default function Edit() {
  const [routes, setRoutes] = useState<Route[]>([])
  async function decodeHandler(files: File[]) {
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const messages = await decoderFitFile(file);
      console.log(messages)
    }
    setRoutes([])
  }

  return (
    <div className='min-h-screen w-full'>
      <FileList files={[]} onConfirm={decodeHandler}></FileList>
      <MapEditor routes={routes}></MapEditor>
    </div>
  );
}
