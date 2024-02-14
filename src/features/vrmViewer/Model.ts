import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { VRMAnimation, createVRMAnimationClip } from '@pixiv/three-vrm-animation';

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

  public get progress(): number {
    const action = this.currentAction;

    if (action != null) {
      return action.time / action.getClip().duration;
    } else {
      return 0.0;
    }
  }

  public async loadAnimation(vrmAnimation: VRMAnimation): Promise<void> {
    const { vrm, mixer } = this;
    if (vrm == null || mixer == null) {
      throw new Error('You have to load VRM first');
    }

    this.currentAction?.stop();
    const clip = createVRMAnimationClip(vrmAnimation, vrm);
    const action = mixer.clipAction(clip);

    this.currentAction = action;
  }

  public playAction() {
    if (this.currentAction && this.mixer) {
      this.currentAction.play();
      this.currentAction.paused = false;
    }
  }

  public pauseAction() {
    if (this.currentAction && this.mixer) {
      this.currentAction.paused = true;
    }
  }

  public setProgress(progress: number) {
    if (this.currentAction && this.mixer) {
      const duration = this.currentAction.getClip().duration;
      this.currentAction.time = duration * progress;
    }
  }

  public update(delta: number): void {
    this.mixer?.update(delta);
    this.vrm?.update(delta);
  }
}
