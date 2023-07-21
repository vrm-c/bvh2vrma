import { useCallback, useEffect, useRef, useState } from 'react';
import { Viewer } from '@/features/vrmViewer/viewer';
import AvatarSample_A from '../assets/AvatarSample_A.vrm';
import { loadVRMAnimation } from '@/lib/VRMAnimation/loadVRMAnimation';
import { Button } from '@charcoal-ui/react';

interface VRMViewerProps {
  blobURL: string | null;
}
export default function VrmViewer(props: VRMViewerProps) {
  const [viewer] = useState<Viewer>(new Viewer());
  const [loadFlag, setLoadFlag] = useState(false);
  const blobURL = props.blobURL;
  const canvasRef = useCallback(
    async (canvas: HTMLCanvasElement) => {
      if (canvas) {
        viewer.setup(canvas);
        await viewer.loadVrm(AvatarSample_A);
        setLoadFlag(true);
      }
    },
    [viewer]
  );
  useEffect(() => {
    (async () => {
      if (blobURL) {
        const VRMAnimation = await loadVRMAnimation(blobURL);
        if (VRMAnimation && loadFlag && viewer.model) {
          await viewer.model.loadAnimation(VRMAnimation);
        }
      }
    })();
  }, [blobURL, loadFlag, viewer.model]);

  const playAnimation = () => {
    if (viewer.model) {
      viewer.model.playAction();
    }
  };

  return (
    <div>
      <div className={'lg:w-[390px] w-[358px] sm:w-[60vw] h-[583px] sm:h-[635px]'}>
        <canvas ref={canvasRef} className={'h-full w-full rounded-24 bg-[--charcoal-surface3]'}></canvas>
      </div>
      <Button onClick={playAnimation}>Play</Button>
    </div>
  );
}
