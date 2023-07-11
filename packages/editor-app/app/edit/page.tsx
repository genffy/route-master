"use client";

import FileList from '@/components/shared/file-list'
import MapEditor from '@/components/shared/map-editor';

export default async function Edit() {

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className='left-0 z-40 w-64'>
        <FileList files={[]}></FileList>
      </div>
      <div className="container">
        <MapEditor routes={[]}></MapEditor>
      </div>
    </div>
  );
}
