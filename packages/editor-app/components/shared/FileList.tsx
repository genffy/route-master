"use client";

import React, { useState } from 'react';
import Uploader from './uploader';
import { PresistFileData } from '@/lib/utils';

export type FileListProps = {
  onConfirm?: (files: File[]) => void;
  onClear?: () => void;
}

const filesData = new PresistFileData()
export default function FileList({ onConfirm, onClear }: FileListProps) {
  // store files in state
  // init file from list
  const [activeFiles, setActiveFiles] = useState<File[]>(filesData.getData())
  function chooseFileHandler(files: File[]) {
    filesData.saveData(files)
    setActiveFiles(filesData.getData());
  }

  function clearHandler() {
    filesData.clear()
    setActiveFiles(filesData.getData());
    onClear?.();
  }

  function renderHandler() {
    onConfirm?.(activeFiles);
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
            activeFiles && activeFiles.length > 0 ? <div className='flex flex-col p-4 mb-4'>
              {activeFiles.map((tag, idx) => (
                <div className="flex items-center" key={idx}>
                  <input type="checkbox" name={tag.name} value={tag.name} className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600' />
                  <label htmlFor={tag.name} className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                    {tag.name}
                  </label>
                </div>
              ))}
            </div> : null
          }
        </div>
        <div className="flex items-center justify-end p-4 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
          <button type="button" className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600" onClick={clearHandler}>Clear</button>
          <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={renderHandler}>Render</button>
        </div>
      </div>
    </div>
  </div>
}

