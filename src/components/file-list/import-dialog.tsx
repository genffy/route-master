import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, } from '@mui/material';
import { PresistFileData } from '@/lib/utils';
import { useState, useMemo, useEffect, Fragment } from 'react';
import Uploader from './uploader';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 130 },
  { field: 'size', headerName: 'Size', width: 130 },
  { field: 'type', headerName: 'Type', width: 130 },
  { field: 'duration', headerName: 'Duration', width: 130 },
  {
    field: 'date',
    headerName: 'CreateTime',
    type: 'string',
    width: 90,
  },
];

const filesData = new PresistFileData()

export interface ImportFilesDialogProps {
  open: boolean;
  onClose: (value: File[], opne: boolean) => void;
}

export default function ImportFilesDialog({
  open,
  onClose,
}: ImportFilesDialogProps) {
  const [files, setFiles] = useState<File[]>([])

  const handleDialogClose = () => {
    onClose(files, false);
  };

  async function chooseFileHandler(files: File[]) {
    filesData.saveData(files)
    setFiles(files)
  }

  function handleDialogConfirm() {
    onClose(files, false);
  }

  const rows = useMemo(() => {
    return files.map((file, idx) => {
      return {
        id: idx,
        name: file.name,
        type: file.type,
        size: file.size,
        duration: '123',
        date: file.lastModified,
      }
    })
  }, [files])

  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
  useEffect(() => {
    console.log('rowSelectionModel', rowSelectionModel)
  }, [rowSelectionModel])

  return <Fragment>
    <Dialog
      scroll="paper"
      disableEscapeKeyDown
      open={open}
      maxWidth="xl"
      onClose={(_event: object, reason: string) => {
        if (['escapeKeyDown', 'backdropClick'].includes(reason)) {
          return;
        }
        handleDialogClose();
      }}
    >
      <DialogTitle>
        Upload  <Chip color="primary" size="small" label=".fit/gpx" />
      </DialogTitle>
      <DialogContent>
        <Uploader onChange={chooseFileHandler}></Uploader>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          onRowSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          rowSelectionModel={rowSelectionModel}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button type="submit" disabled={rowSelectionModel.length === 0} onClick={handleDialogConfirm}>Import</Button>
      </DialogActions>
    </Dialog>
  </Fragment>
}
