'use client';

import React, { useState } from 'react'

import FileList from '@/components/shared/FileList'
import MapEditor, { type Route } from '@/components/shared/MapEditor';
import { decoderFitFile } from '@/lib/fit';
import mockRoutes from '@/mock/routes.json'

export default function Edit() {
  const [routes, setRoutes] = useState<Route[]>(mockRoutes)
  // decode different file type
  // fit
  // gpx
  async function decodeHandler(files: File[]) {
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const messages = await decoderFitFile(file);
      const { recordMesgs } = messages;
      const fitRoutes = recordMesgs.filter((item: any) => {
        // filter out invalid data
        if (item.positionLat && item.positionLong) {
          return true
        }
        console.log(item)
        return false
      }).map((item: any) => {
        const { positionLat, positionLong, altitude } = item
        // https://gis.stackexchange.com/a/122257/228012
        return {
          latitude: positionLat / 11930465,
          longitute: positionLong / 11930465,
          alt: altitude,
        }
      })
      console.log(fitRoutes)
      setRoutes(fitRoutes)
    }
    // setRoutes([])
    console.log(routes)
  }

  return (
    <div className='min-h-screen w-full'>
      <FileList onConfirm={decodeHandler}></FileList>
      <MapEditor routes={routes}></MapEditor>
    </div>
  );
}
