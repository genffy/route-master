import FileList from '@/components/shared/FileList'
import MapEditor from '@/components/shared/MapEditor';

export default async function Edit() {

  return (
    <div className='min-h-screen w-full'>
      <FileList files={[]}></FileList>
      <MapEditor routes={[]}></MapEditor>
    </div>
  );
}
