import { Button, Modal, ModalBody, ModalButtons, OverlayProvider } from '@charcoal-ui/react';
import { useEffect } from 'react';
import { OverlayTriggerState } from 'react-stately';

interface ModalWrapperProps {
  state: OverlayTriggerState;
}
const ModalWrapper = (props: ModalWrapperProps) => {
  const state = props.state;
  useEffect(() => {
    state.open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <OverlayProvider>
      <Modal size="L" title="" isOpen={state.isOpen} onClose={() => state.close()}>
        {/* <ModalHeader /> */}
        <ModalBody className="py-32 mx-64 text-[14px]">
          <div className="py-24 text-[--charcoal-brand] text-[20px]">
            このアプリケーションについて
          </div>
          <div>
            <ul className="list-disc pl-24">
              <li>bvhファイルをVRMAnimationファイル(vrma)に変換するアプリケーションです。</li>
              <li>このサイトは入力されたbvhファイルをサーバーにアップロードしません。</li>
              <li>
                このサイトのライセンスはMITです。リポジトリのリンクは
                <a className="text-[#3D7699]" href="https://github.com/vrm-c/bvh2vrma">
                  こちら
                </a>
                です。
              </li>
            </ul>
          </div>
          <div className="py-24 text-[--charcoal-brand] text-[20px]">利用上の注意</div>
          <ul className="pl-24 list-disc">
            <li>
              VRMAnimationファイル(vrma)の仕様はドラフト段階です。詳しい仕様に関しましては
              <a
                className="text-[#3D7699]"
                href="https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm_animation-1.0/README.ja.md"
              >
                GitHub
              </a>
              にてご覧ください。
            </li>
            <li>
              変換結果を保証するものではありません。入力されたbvhファイルによっては失敗することがあります。
            </li>
            <li>
              ドラフトのため、書き出されたデータが将来的な仕様変更により使えなくなることがあります。
            </li>
          </ul>
          <ModalButtons>
            <Button variant="Primary" onClick={() => state.close()} fixed>
              利用する
            </Button>
          </ModalButtons>
        </ModalBody>
      </Modal>
    </OverlayProvider>
  );
};
export default ModalWrapper;
