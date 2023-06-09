import * as THREE from 'three';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRMAnimation } from '../../lib/VRMAnimation/VRMAnimation';

export class Model {
  public vrm?: VRM;
  public mixer?: THREE.AnimationMixer;
  public helperRoot?: THREE.Group;
  private currentAction?: THREE.AnimationAction;

  public async loadVRM(url: string): Promise<void> {
    const loader = new GLTFLoader();
    this.helperRoot = new THREE.Group();
    loader.register((parser) => new VRMLoaderPlugin(parser, { helperRoot: this.helperRoot }));

    const gltf = await loader.loadAsync(url);

    const vrm = (this.vrm = gltf.userData.vrm);
    vrm.scene.name = 'VRMRoot';

    VRMUtils.rotateVRM0(vrm);

    this.mixer = new THREE.AnimationMixer(vrm.scene);
  }

  public async loadAnimation(vrmAnimation: VRMAnimation): Promise<void> {
    const { vrm, mixer } = this;
    if (vrm == null || mixer == null) {
      throw new Error('You have to load VRM first');
    }

    this.currentAction?.stop();
    const clip = vrmAnimation.createAnimationClip(vrm);
    const action = mixer.clipAction(clip);

    this.currentAction = action;
  }

  public playAction() {
    if (this.currentAction && this.mixer) {
      this.mixer.addEventListener('loop', () => {
        this.currentAction?.stop();
      });
      this.currentAction.play();
    }
  }

  public update(delta: number): void {
    this.mixer?.update(delta);
    this.vrm?.update(delta);
  }
}
