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
        <ModalBody className="py-32 mx-64 typography-14">
          <div className="py-24 text-brand typography-20">このアプリケーションについて</div>
          <div>
            <ul className="list-disc pl-24">
              <li>bvhファイルをVRMアニメーションファイル (vrma) に変換するアプリケーションです。</li>
              <li>
                VRMアニメーションファイルについての詳細は
                <a
                  className="text-link1"
                  href="https://vrm.dev/vrma/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Webサイト
                </a>
                をご覧ください。
              </li>
              <li>このサイトは入力されたbvhファイルをサーバーにアップロードしません。</li>
              <li>
                このサイトのライセンスはMITです。リポジトリのリンクは
                <a
                  className="text-link1"
                  href="https://github.com/vrm-c/bvh2vrma"
                  target="_blank"
                  rel="noreferrer"
                >
                  こちら
                </a>
                です。
              </li>
            </ul>
          </div>
          <div className="py-24 text-brand typography-20">利用上の注意</div>
          <ul className="pl-24 list-disc">
            <li>
              VRMアニメーションファイル (vrma) の詳しい仕様については
              <a
                className="text-link1"
                href="https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm_animation-1.0/README.ja.md"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              をご覧ください。
            </li>
            <li>
              変換結果を保証するものではありません。入力されたbvhファイルによっては失敗することがあります。
            </li>
          </ul>
          <ModalButtons>
            <Button variant="Primary" onClick={() => state.close()}>
              利用する
            </Button>
          </ModalButtons>
        </ModalBody>
      </Modal>
    </OverlayProvider>
  );
};
export default ModalWrapper;
