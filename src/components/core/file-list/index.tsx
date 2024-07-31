import { useState } from 'react';
import Uploader from './uploader';
import { PresistFileData } from '@/lib/utils';
import { Clear } from '@mui/icons-material';
import { Box, IconButton, Divider } from '@mui/material';
import { decodeFile } from '@/lib/convert';
import type { ExtendFeatureCollection } from '@/components/core/map-editor/types';

export type FileListProps = {
  onLoaded?: (actives: any[]) => void;
  onClear?: () => void;
}

const filesData = new PresistFileData()

export default function FileList({ onLoaded }: FileListProps) {
  const [files, setFiles] = useState<File[]>(filesData.getData())
  const [active, setActive] = useState<File | null>(filesData.getData()[0])

  async function fileChangeHandler(idx: number = 0) {

    const actives: any[] = []
    for (const file of filesData.getData()) {
      const content: ExtendFeatureCollection = await decodeFile(file)
      content.properties = {
        id: btoa(file.name),
        name: file.name,
        active: false
      }
      if (idx === filesData.getData().indexOf(file)) {
        content.properties.active = true
      } else {
        content.properties.active = false
      }
      actives.push(content)
    }
    onLoaded && onLoaded(actives);
  }
  async function chooseFileHandler(files: File[]) {
    filesData.saveData(files)
    setFiles(filesData.getData());
    fileChangeHandler()
  }

  function removeHandler(file: File) {
    filesData.removeData(file.name)
    setFiles(filesData.getData());
    fileChangeHandler();
  }

  function onSelectHandler(file: File, idx: number) {
    setActive(file)
    fileChangeHandler(idx)
  }

  return <div className='absolute top-4 left-4 z-20 w-80'>
    <div className="w-full h-[calc(100%-1rem)]">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow dark:bg-gray-700">
        <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
          <p className="text-xl font-semibold text-gray-900 dark:text-white">.fit/gpx</p>
        </div>
        <div className='container w-full max-h-96 overflow-auto p-4'>
          <Uploader onChange={chooseFileHandler}></Uploader>
          {files.length > 0 && <>
            <Divider />
            <Box
              sx={{
                bgcolor: 'var(--mui-palette-background-default)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4',
                position: 'relative',
                minHeight: '100%',
              }}
            >
              {
                files.map((file, idx) => (
                  <Box sx={{
                    p: 2,
                    direction: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    bgcolor: 'var(--mui-palette-background-default)',
                    borderRadius: '4px',
                  }} className={`bg-sky-200 hover:bg-sky-300 cursor-pointer rounded-md text-slate-500 ${active?.name === file.name ? 'bg-sky-300' : ''}`} key={idx} onClick={() => onSelectHandler(file, idx)}>
                    <p style={{ fontWeight: 'blod' }}>{file.name}</p>
                    <IconButton type="button" className='cursor-pointer' onClick={() => removeHandler(file)} >
                      <Clear></Clear>
                    </IconButton>
                  </Box>
                ))
              }
            </Box>

          </>}
        </div>
      </div>
    </div>
  </div >
}

