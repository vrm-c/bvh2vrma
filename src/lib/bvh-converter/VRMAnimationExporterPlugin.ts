import * as THREE from 'three';
import { GLTFExporterPlugin, GLTFWriter } from 'three/examples/jsm/exporters/GLTFExporter';
import { GLTF as GLTFSchema } from '@gltf-transform/core';
import { VRMHumanBoneName } from '@pixiv/three-vrm';
import { VRMCVRMAnimation } from '@pixiv/types-vrmc-vrm-animation-1.0';

const EXTENSION_NAME = 'VRMC_vrm_animation';

export class VRMAnimationExporterPlugin implements GLTFExporterPlugin {
  public readonly writer: GLTFWriter;
  public readonly name = EXTENSION_NAME;

  public constructor(writer: GLTFWriter) {
    this.writer = writer;
  }

  public afterParse(input: THREE.Object3D | THREE.Object3D[]): void {
    if (!Array.isArray(input)) {
      return;
    }

    const root = input[0];

    const vrmBoneMap: Map<VRMHumanBoneName, THREE.Object3D> | undefined = root.userData?.vrmBoneMap;
    if (vrmBoneMap == null) {
      return;
    }

    const humanBones: { [name in VRMHumanBoneName]?: { node: number } } = {};
    for (const [boneName, bone] of vrmBoneMap) {
      const node = (this.writer as any).nodeMap.get(bone);

      if (node != null) {
        humanBones[boneName] = { node };
      }
    }

    const humanoid = { humanBones };

    const extension: VRMCVRMAnimation = {
      specVersion: '1.0',
      // @ts-expect-error: will fix the three-vrm side later
      humanoid,
    };

    const gltfDef = (this.writer as any).json as GLTFSchema.IGLTF;

    gltfDef.extensionsUsed ??= [];
    gltfDef.extensionsUsed.push(EXTENSION_NAME);

    gltfDef.extensions ??= {};
    gltfDef.extensions[EXTENSION_NAME] = extension;
  }
}
