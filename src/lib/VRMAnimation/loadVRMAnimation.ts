import { VRMAnimation, VRMAnimationLoaderPlugin } from '@pixiv/three-vrm-animation';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();
loader.register((parser) => new VRMAnimationLoaderPlugin(parser));

export async function loadVRMAnimation(url: string): Promise<VRMAnimation | null> {
  const gltf = await loader.loadAsync(url);

  const vrmAnimations: VRMAnimation[] = gltf.userData.vrmAnimations;
  const vrmAnimation: VRMAnimation | undefined = vrmAnimations[0];

  return vrmAnimation ?? null;
}
