"use client";

import React from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import './FileList.style.css';
import Uploader from './uploader';
import Draggable from 'react-draggable'
import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons';
export type FileListProps = {
  files: File[];
}

export default function FileList({ files }: FileListProps) {
  // store files in state
  // init file from list
  const [activeFiles, setActiveFiles] = React.useState<File[]>(files)
  function chooseFileHandler(event: React.FormEvent<HTMLInputElement>) {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      const i = event.currentTarget.files[0];
      setActiveFiles([...activeFiles, i]);
    }
  }

  return <Draggable>
    <div className='absolute z-50'>
      <ScrollArea.Root className="ScrollAreaRoot">
        <ScrollArea.Viewport className="ScrollAreaViewport">
          <Uploader></Uploader>
          {/* file list */}
          {
            activeFiles && activeFiles.length > 0 ? <div style={{ padding: '15px 20px' }}>
              <div className="Text">Files</div>
              {activeFiles.map((tag, idx) => (
                <div className="Tag" key={idx}>
                  {tag.name}
                </div>
              ))}
            </div> : null
          }
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="ScrollAreaScrollbar" orientation="vertical">
          <ScrollArea.Thumb className="ScrollAreaThumb" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Scrollbar className="ScrollAreaScrollbar" orientation="horizontal">
          <ScrollArea.Thumb className="ScrollAreaThumb" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner className="ScrollAreaCorner" />
      </ScrollArea.Root>
    </div>
  </Draggable>
}

