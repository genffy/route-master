
"use client";

import { FileIcon } from '@radix-ui/react-icons'
import {
  useState,
  useCallback,
} from "react";
import { useDropzone } from 'react-dropzone'
type UploaderProps = {
  onChange?: (files: File[]) => void;
}
export default function Uploader({
  onChange,
}: UploaderProps) {
  const [activeFiles, setActiveFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (activeFiles) {
      setActiveFiles([...activeFiles, ...acceptedFiles]);
    } else {
      setActiveFiles([...acceptedFiles]);
    }
    onChange && onChange(acceptedFiles);
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  })
  return (
    <>
      <div className="flex items-center justify-center w-full"  {...getRootProps()}>
        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full m-4 h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileIcon></FileIcon>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">FIT, GPX</p>
          </div>
          <input id="dropzone-file" name='dropzone-file' {...getInputProps()} accept='.fit, .gpx' />
        </label>
      </div>

    </>
  )
}
