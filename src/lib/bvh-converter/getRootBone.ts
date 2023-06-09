import * as THREE from "three";

export function getRootBone(skeleton: THREE.Skeleton): THREE.Bone {
  const boneSet = new Set<THREE.Object3D>(skeleton.bones);

  for (const bone of skeleton.bones) {
    if (bone.parent == null || !boneSet.has(bone.parent)) {
      return bone;
    }
  }

  throw new Error(
    "Invalid skeleton. Could not find the root bone of the given skeleton."
  );
}
