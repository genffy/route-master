"use client";

import React, { ChangeEvent, useState } from 'react';
import Uploader from './uploader';
import { PresistFileData } from '@/lib/utils';
import { Cross1Icon } from '@radix-ui/react-icons';
import { Badge, IconButton } from '@radix-ui/themes';

export type FileListProps = {
  onLoaded?: (files: File[]) => void;
  onClear?: () => void;
}

const filesData = new PresistFileData()

export default function FileList({ onLoaded, onClear }: FileListProps) {
  // store files in state
  // init file from list
  const [activeFiles, setActiveFiles] = useState<File[]>([])
  const [files, setFiles] = useState<File[]>(filesData.getData())
  function chooseFileHandler(files: File[]) {
    filesData.saveData(files)
    setFiles(filesData.getData());
    onLoaded?.(files);
  }

  function clearHandler() {
    filesData.clear()
    setFiles(filesData.getData());
    onClear?.();
  }

  function removeHandler(file: File) {
    filesData.removeData(file.name)
    setFiles(filesData.getData());
  }

  function renderHandler() {
    onLoaded?.(activeFiles);
  }
  function changeHandler(evt: ChangeEvent, file: File) {
    const target = evt.target as HTMLInputElement;
    if (target.checked) {
      setActiveFiles([...activeFiles, file]);
    } else {
      setActiveFiles(activeFiles.filter(f => f.name !== file.name));
    }
  }
  return <div className='absolute top-4 left-4 z-20 w-80'>
    {/* title */}
    <div className="w-full h-[calc(100%-1rem)]">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow dark:bg-gray-700">
        <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
          <p className="text-xl font-semibold text-gray-900 dark:text-white">.FIT/.GPX</p>
        </div>
        <div className='container w-full max-h-96 overflow-auto'>
          <Uploader onChange={chooseFileHandler}></Uploader>
          {
            files && files.length > 0 ? <div className='flex flex-col p-4 mb-4'>
              {files.map((file, idx) => (
                <div className="flex items-center" key={idx}>
                  <Badge color="cyan">
                    {file.name}
                    <IconButton type="button" onClick={() => removeHandler(file)} >
                      <Cross1Icon></Cross1Icon>
                    </IconButton>
                  </Badge>
                  {/* <label htmlFor={file.name} className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                    {file.name}
                  </label>
                  <IconButton type="button" onClick={() => removeHandler(file)} >
                    <Cross1Icon></Cross1Icon>
                  </IconButton> */}
                </div>
              ))}
            </div> : null
          }
        </div>
      </div>
    </div>
  </div>
}

