import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { BVH } from "three/examples/jsm/loaders/BVHLoader";
import { getRootBone } from "./getRootBone";
import { mapSkeletonToVRM } from "./mapSkeletonToVRM";
import { VRMAnimationExporterPlugin } from "./VRMAnimationExporterPlugin";

const _v3A = new THREE.Vector3();

function createSkeletonBoundingBox(skeleton: THREE.Skeleton): THREE.Box3 {
  const boundingBox = new THREE.Box3();
  for (const bone of skeleton.bones) {
    boundingBox.expandByPoint(bone.getWorldPosition(_v3A));
  }
  return boundingBox;
}

export async function convertBVHToVRMAnimation(
  bvh: BVH,
  options?: {
    scale?: number;
  }
): Promise<ArrayBuffer> {
  const skeleton = bvh.skeleton.clone();

  const clip = bvh.clip.clone();

  // find root bone of the skeleton
  const rootBone = getRootBone(skeleton);

  // some BVHs does not ground correctly
  const boundingBox = createSkeletonBoundingBox(skeleton);
  rootBone.position.y -= boundingBox.min.y;

  // insert a root node which scales the entire skeleton by 0.01
  const root = new THREE.Group();
  root.scale.setScalar(options?.scale ?? 0.01);

  root.add(rootBone);
  root.updateWorldMatrix(false, true);

  // create a map from vrm bone names to bones
  const vrmBoneMap = mapSkeletonToVRM(rootBone);
  root.userData.vrmBoneMap = vrmBoneMap;

  const hipsBone = vrmBoneMap.get("hips")!;
  const hipsBoneName = hipsBone.name;
  let hipsPositionTrack: THREE.VectorKeyframeTrack | null = null;

  const spineBone = vrmBoneMap.get("spine")!;
  const spineBoneName = spineBone.name;
  let spinePositionTrack: THREE.VectorKeyframeTrack | null = null;

  // rename tracks + remove translation tracks other than hips + pickup spine track
  const filteredTracks: THREE.KeyframeTrack[] = [];

  for (const origTrack of bvh.clip.tracks) {
    const track = origTrack.clone();
    track.name = track.name.replace(/\.bones\[(.*)\]/, "$1");

    if (track.name.endsWith(".quaternion")) {
      filteredTracks.push(track);
    }

    if (track.name === `${hipsBoneName}.position`) {
      hipsPositionTrack = track;
      filteredTracks.push(track);
    }

    if (track.name === `${spineBoneName}.position`) {
      spinePositionTrack = track;
    }
  }

  clip.tracks = filteredTracks;

  // some BVHs might have different position scales between rest and animation
  if (hipsPositionTrack != null && spinePositionTrack != null) {
    const restSpineLength = spineBone.position.length();
    const animSpineLength = _v3A.fromArray(spinePositionTrack.values).length();
    const restAnimationScaleRatio = restSpineLength / animSpineLength;

    for (let i = 0; i < hipsPositionTrack.values.length; i++) {
      hipsPositionTrack.values[i] *= restAnimationScaleRatio;
    }
  }

  // export as a gltf
  const exporter = new GLTFExporter();
  exporter.register((writer) => new VRMAnimationExporterPlugin(writer));

  const gltf = await exporter.parseAsync(root, {
    animations: [clip],
    binary: true,
  });
  return gltf as ArrayBuffer;
}
