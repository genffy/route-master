"use client";

import React, { ChangeEvent, useState } from 'react';
import Uploader from './uploader';
import { PresistFileData } from '@/lib/utils';
import { Cross1Icon } from '@radix-ui/react-icons';
import { Badge, Flex, IconButton, RadioCards, Text } from '@radix-ui/themes';
import { decoderFitFile } from '@/lib/fit';

export type FileListProps = {
  onLoaded?: (actives: any[]) => void;
  onClear?: () => void;
}

const filesData = new PresistFileData()

export default function FileList({ onLoaded, onClear }: FileListProps) {
  const [files, setFiles] = useState<File[]>(filesData.getData())

  async function fileChangeHandler() {
    const actives: any[] = []
    for (const file of filesData.getData()) {
      const content = await decoderFitFile(file)
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

  return <div className='absolute top-4 left-4 z-20 w-80'>
    <div className="w-full h-[calc(100%-1rem)]">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow dark:bg-gray-700">
        <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
          <p className="text-xl font-semibold text-gray-900 dark:text-white">.fit/gpx</p>
        </div>
        <div className='container w-full max-h-96 overflow-auto p-4'>
          <Uploader onChange={chooseFileHandler}></Uploader>
          <hr className='my-4' />
          <RadioCards.Root defaultValue={files[0]?.name}>
            {
              files.map((file, idx) => (
                <RadioCards.Item value={file.name} key={idx}>
                  <Flex direction="row" align="center" justify="between" width="100%">
                    <Text weight="bold">{file.name}</Text>
                    <IconButton size={'1'} type="button" onClick={() => removeHandler(file)} >
                      <Cross1Icon></Cross1Icon>
                    </IconButton>
                  </Flex>
                </RadioCards.Item>
              ))
            }
          </RadioCards.Root>
        </div>
      </div>
    </div>
  </div>
}

