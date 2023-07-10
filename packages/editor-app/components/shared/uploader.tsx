
// TODO: Implement uploader component
import Modal from "@/components/shared/modal";
import {
  useState,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import { APP_DOMAIN_URL } from "@/lib/constants";

const UploaderModal = ({
  showUploaderModal,
  setShowUploaderModal,
}: {
  showUploaderModal: boolean;
  setShowUploaderModal: Dispatch<SetStateAction<boolean>>;
}) => {
  // FIXME: remove any
  const [fit, setFit] = useState<any>(null);

  async function decodeFit() {
    const body = new FormData();
    body.append("file", fit);
    const { data } = await fetch('/api/fit', {
      method: 'POSt',
      body
    }).then(res => res.json())
    console.log(data)
  }
  const uploadToClient = (event: React.FormEvent<HTMLInputElement>) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      const i = event.currentTarget.files[0];
      setFit(i);
    }
  };
  return (
    <Modal showModal={showUploaderModal} setShowModal={setShowUploaderModal}>
      <div className="w-full overflow-hidden md:max-w-md md:rounded-2xl md:border md:border-gray-100 md:shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 bg-white px-4 py-6 pt-8 text-center md:px-16">
          <input type="file" placeholder="please select FIT file" accept=".fit" onChange={uploadToClient} />
          <button
            onClick={() => decodeFit()}
            className="flex w-36 items-center justify-center rounded-md border border-gray-300 px-3 py-2 transition-all duration-75 hover:border-gray-800 focus:outline-none active:bg-gray-100"
          >
            <p className="text-gray-600">Decode Fit</p>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export function useUploaderModal() {
  const [showUploaderModal, setShowUploaderModal] = useState(false);

  const UploaderModalCallback = useCallback(() => {
    return (
      <UploaderModal
        showUploaderModal={showUploaderModal}
        setShowUploaderModal={setShowUploaderModal}
      />
    );
  }, [showUploaderModal, setShowUploaderModal]);

  return useMemo(
    () => ({ setShowUploaderModal, UploaderModal: UploaderModalCallback }),
    [setShowUploaderModal, UploaderModalCallback],
  );
}
