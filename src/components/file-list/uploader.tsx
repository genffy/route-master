
import { CloudUploadOutlined } from '@mui/icons-material'
import { Box, Typography } from '@mui/material';
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
    <Box sx={{
      border: '1px dashed #9ca3af',
      borderRadius: '0.25rem',
      padding: '0.5rem',
      backgroundColor: isDragActive ? '#9ca3af' : '#f3f4f6',
      color: isDragActive ? 'white' : '#9ca3af',
      outline: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    }} {...getRootProps()}>
      <CloudUploadOutlined></CloudUploadOutlined>
      <Typography sx={{
        marginLeft: '0.5rem',
        cursor: 'pointer',
      }}>Click to upload or drag and drop</Typography>
      <input id="dropzone-file" name='dropzone-file' {...getInputProps()} />
    </Box>
  )
}
