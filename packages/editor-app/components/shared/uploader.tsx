
"use client";
import { FileIcon } from '@radix-ui/react-icons'
import {
  useState,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";
import {useDropzone} from 'react-dropzone'

export default function Uploader() {
  const [activeFiles, setActiveFiles] = useState<File[]>();
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files
    if(activeFiles){
      setActiveFiles([...activeFiles, ...acceptedFiles]);
    }else {
      setActiveFiles([...acceptedFiles]);
    }
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
  // const uploadToClient = (event: React.FormEvent<HTMLInputElement>) => {
  //   if (event.currentTarget.files && event.currentTarget.files[0]) {
  //     const i = event.currentTarget.files[0];
  //     setActiveFiles([...activeFiles, i]);
  //   }
  // };
  return (
    <>
    <div className="flex items-center justify-center w-full">
      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
             <FileIcon></FileIcon>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
          </div>
          <input id="dropzone-file" type="file" className="hidden" />
      </label>
  </div>

    <div {...getRootProps()} className="border-dashed border-2 border-indigo-600">
      <FileIcon></FileIcon>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop the files here ...</p> :
          <p>Drag n drop some files here, or click to select files</p>
      }
      {activeFiles?.length}
    </div>
    </>


  )
}
