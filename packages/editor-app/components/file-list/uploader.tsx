
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
    // prevent select repeat
    acceptedFiles = acceptedFiles.filter((file) => !activeFiles.some((activeFile) => activeFile.name === file.name));
    if (activeFiles) {
      setActiveFiles([...activeFiles, ...acceptedFiles]);
    } else {
      setActiveFiles([...acceptedFiles]);
    }
    onChange && onChange(acceptedFiles);
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/fit': ['.fit'],
      'application/gpx': ['.gpx'],
      // 'application/vnd.google-earth.kml+xml': ['.kml'],
      // 'application/vnd.google-earth.kmz': ['.kmz'],
      // 'application/vnd.garmin.tcx+xml': ['.tcx'],
    },
    onDrop,
  })
  return (
    <div className="flex items-center justify-center w-full"  {...getRootProps()}>
      <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
        <div className="flex flex-col items-center justify-center py-6">
          <FileIcon className="w-8 h-8 mb-3 text-gray-400"></FileIcon>
          <p className="mb-1 text-sm text-gray-600">
            <span className="font-medium">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">FIT, GPX</p>
        </div>
        <input id="dropzone-file" name='dropzone-file' {...getInputProps()} />
      </label>
    </div>
  )
}
