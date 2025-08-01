"use client";

import React, { useState } from 'react';
import Uploader from './uploader';
import { PresistFileData } from '@/lib/utils';
import { Cross1Icon } from '@radix-ui/react-icons';
import { Flex, IconButton, Separator, Text } from '@radix-ui/themes';
import { decodeFile } from '@/lib/convert';
import type { ExtendFeatureCollection } from '@/components/map-editor/types';

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
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <p className="text-lg font-medium text-gray-900">.fit/gpx</p>
      </div>
      <div className='p-4 max-h-96 overflow-auto'>
        <Uploader onChange={chooseFileHandler}></Uploader>
        {files.length > 0 && <>
          <div className='my-4 h-px bg-gray-200'></div>
          <Flex direction="column" gap="2">
            {
              files.map((file, idx) => (
                <Flex p="3" direction="row" align="center" justify="between" width="100%" className={`bg-gray-50 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors ${active?.name === file.name ? 'bg-blue-50 border border-blue-200' : ''}`} key={idx} onClick={() => onSelectHandler(file, idx)}>
                  <Text size="2" weight="medium" className="text-gray-700">{file.name}</Text>
                  <IconButton size={'1'} variant="ghost" className='cursor-pointer text-gray-400 hover:text-gray-600' onClick={(e) => { e.stopPropagation(); removeHandler(file) }} >
                    <Cross1Icon></Cross1Icon>
                  </IconButton>
                </Flex>
              ))
            }
          </Flex>
        </>}
      </div>
    </div>
  </div>
}

