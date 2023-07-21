import { convertBVHToVRMAnimation } from '@/lib/bvh-converter/convertBVHToVRMAnimation';
import { saveBlob } from '@/utils/saveBlob';
import { BVHLoader } from 'three/examples/jsm/loaders/BVHLoader';
import { useState, DragEvent, useRef, Dispatch, SetStateAction } from 'react';
import '@charcoal-ui/icons';
import { Button, LoadingSpinner } from '@charcoal-ui/react';

interface FileBlob {
  blob: Blob;
  name: string;
}
interface LoadBVHProps {
  setBlobURL: Dispatch<SetStateAction<string | null>>;
}
const LoadBVH = (props: LoadBVHProps) => {
  const [error, setError] = useState('');
  const [nowConvert, setNowConvert] = useState(false);
  const [completed, setCompleted] = useState(false);
  const vrmaBlob = useRef<FileBlob | null>(null);
  const bvhLoader = new BVHLoader();
  const setBlobURL = props.setBlobURL;
  const initializeState = () => {
    setError('');
    setNowConvert(false);
    setCompleted(false);
    vrmaBlob.current = null;
    setBlobURL(null);
  };
  const changeExtension = (fileName: string, newExtension: string) => {
    const parts = fileName.split('.');
    parts[parts.length - 1] = newExtension;
    return parts.join('.');
  };
  const convertWrapper = async (file: File) => {
    setNowConvert(true);
    let isPropertyConverted = true;
    try {
      if (!file.name.endsWith('.bvh')) {
        throw new Error('Uploaded file is not a BVH file.');
      }
      const fileText = await file.text();

      const bvh = bvhLoader.parse(fileText);
      const vrmaBuffer = await convertBVHToVRMAnimation(bvh);

      const vrmaDict: FileBlob = { blob: new Blob([vrmaBuffer]), name: file.name };
      setBlobURL(URL.createObjectURL(vrmaDict.blob));
      vrmaBlob.current = vrmaDict;
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
        isPropertyConverted = false;
      }
    }
    setNowConvert(false);
    if (isPropertyConverted) {
      setCompleted(true);
    }
  };
  const dropHandler = (e: DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (e.dataTransfer.items) {
      [...e.dataTransfer.items].forEach((item: DataTransferItem) => {
        if (item.kind == 'file') {
          const file = item.getAsFile();
          if (file != null) {
            convertWrapper(file);
          }
        }
      });
    }
  };

  const fileDownload = () => {
    if (vrmaBlob.current) {
      const blob = vrmaBlob.current.blob;
      const fileName = vrmaBlob.current.name;
      saveBlob(blob, changeExtension(fileName, 'vrma'));
    }
  };
  const onClick = () => {
    const input = document.createElement('input');
    input.type = 'file';

    input.addEventListener('change', () => {
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        convertWrapper(file);
      }
    });

    input.click();
  };

  return (
    <div className="flex items-center justify-center h-full w-full border-dashed border-2 border-[--charcoal-text4] text-center rounded-16 typography-20">
      {nowConvert ? (
        <div>
          <div className="pb-16">
            <LoadingSpinner size={48} padding={16} transparent={false} />
          </div>
          <div className="font-bold text-text3">VRMAファイルに変換中...</div>
        </div>
      ) : completed ? (
        <div>
          <div className="flex justify-center pb-16">
            <pixiv-icon class="text-text4" name="24/Check" scale="2"></pixiv-icon>
          </div>
          <div className="text-center font-bold text-text3 pb-24">変更が完了しました</div>
          <div className="pb-8">
            <Button onClick={fileDownload} variant="Primary">
              ファイルをダウンロード
            </Button>
          </div>
          <div className="flex justify-center ">
            <button className="text-link1 typography-14" onClick={initializeState}>
              他のファイルを変換
            </button>
          </div>
        </div>
      ) : (
        <>
          {error.length == 0 ? (
            <>
              <button className="h-full w-full" onClick={onClick}>
                <div
                  className="h-full w-full flex items-center justify-center"
                  onDrop={dropHandler}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div>
                    <div className="flex justify-center pb-16">
                      <pixiv-icon class="text-text4" name="24/File" scale="2"></pixiv-icon>
                    </div>
                    <div className="font-bold text-text3 sm:hidden">ファイルを選択</div>
                    <div className="font-bold text-text3 max-sm:hidden">
                      bvhファイルをドラッグ&ドロップ
                      <br />
                      もしくはクリックしてファイルを選択
                    </div>
                  </div>
                </div>
              </button>
            </>
          ) : (
            <div>
              <div className="flex justify-center pb-16">
                <pixiv-icon class="text-text4" name="24/Error" scale="2"></pixiv-icon>
              </div>
              <div className="font-bold text-text3 pb-16">
                エラーが発生しました。
                <br />
                {error}
                <br />
                再度アップロードしてください。
              </div>
              <Button onClick={initializeState}>他のファイルを変換</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default LoadBVH;
