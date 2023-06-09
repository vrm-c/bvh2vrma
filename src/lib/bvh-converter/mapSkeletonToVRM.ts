import * as THREE from 'three';
import { VRMHumanBoneName } from '@pixiv/three-vrm';

const _v3A = new THREE.Vector3();

/**
 * Traverse descendants of given object.
 * Once the given function returns `true`, it stops the traversal operation and returns the object.
 *
 * It will perform breadth first search.
 */
function objectBFS(
  root: THREE.Object3D,
  fn: (obj: THREE.Object3D) => boolean | void
): THREE.Object3D | null {
  const queue = [root];

  while (queue.length > 0) {
    const obj = queue.shift()!;
    if (fn(obj)) {
      return obj;
    }
    queue.push(...obj.children);
  }

  return null;
}

/**
 * Traverse ancestors of given object.
 * Once the given function returns `true`, it stops the traversal operation and returns the object.
 */
function objectSearchAncestors(
  root: THREE.Object3D,
  fn: (obj: THREE.Object3D) => boolean | void
): THREE.Object3D | null {
  let obj: THREE.Object3D | null = root;

  while (obj != null) {
    if (fn(obj)) {
      return obj;
    }
    obj = obj.parent;
  }

  return null;
}

/**
 * Sort the given array of Object3D by world position x.
 * This function sort the array in place, mutates the given array.
 */
function sortObjectArrayByWorldX<T extends THREE.Object3D>(objects: T[]): T[] {
  const objWorldXMap = new Map<T, number>();

  for (const obj of objects) {
    objWorldXMap.set(obj, obj.getWorldPosition(_v3A).x);
  }

  return objects.sort((a, b) => objWorldXMap.get(a)! - objWorldXMap.get(b)!);
}

/**
 * Determine spine, chest, and upperChest.
 *
 * Give it a hips bone and a bone with three children which is supposed to be a chest bone.
 */
function determineSpineBones(
  hips: THREE.Bone,
  chestCand: THREE.Bone
): [spine: THREE.Bone, chest: THREE.Bone, upperChest: THREE.Bone | null] {
  // create an array from the hips to the chest
  const spineBones: THREE.Bone[] = [];
  objectSearchAncestors(chestCand, (obj) => {
    spineBones.unshift(obj as THREE.Bone);
    return obj === hips;
  });

  // map spine bones to VRM humanoid definition
  if (spineBones.length < 3) {
    throw new Error('Not enough spine bones.');
  } else if (spineBones.length === 3) {
    // hips - spine - chest
    return [spineBones[1], spineBones[2], null];
  } else if (spineBones.length === 4) {
    // hips - spine - chest - upperChest
    return [spineBones[1], spineBones[2], spineBones[3]];
  } else {
    // too much spine bones
    console.warn(
      'The skeleton has more spine bones than VRM requires. You might get an unexpected result.'
    );

    return [
      spineBones[Math.floor((spineBones.length - 1) / 3.0)],
      spineBones[Math.floor(((spineBones.length - 1) / 3.0) * 2.0)],
      spineBones[spineBones.length - 1],
    ];
  }
}

/**
 * Determine upperLeg, lowerLeg, foot, and toes.
 *
 * Give it a bone which is a child of hips and supposed to be a root of leg.
 */
function determineLegBones(
  legRoot: THREE.Bone
): [upperLeg: THREE.Bone, lowerLeg: THREE.Bone, foot: THREE.Bone, toes: THREE.Bone | null] {
  const bones: {
    bone: THREE.Bone;
    len: number;
    depth: number;
  }[] = [];

  {
    let currentBone: THREE.Bone | undefined = legRoot;
    let currentDepth = 0;

    while (currentBone != null) {
      const firstChild = currentBone.children[0] as THREE.Bone | undefined;

      bones.push({
        bone: currentBone,
        depth: currentDepth,
        len: firstChild?.position.length() ?? 0.0,
      });

      currentBone = firstChild;
      currentDepth++;
    }
  }

  if (bones.length < 3) {
    throw new Error('Not enough leg bones.');
  }

  const [upperLeg, lowerLeg] = bones
    .concat()
    .sort((a, b) => b.len - a.len) // sort by bone length, longer comes first
    .slice(0, 2) // pick three longest bones
    .sort((a, b) => a.depth - b.depth); // sort by depth

  const foot = bones[lowerLeg.depth + 1];
  if (foot == null) {
    throw new Error('Could not find the foot bone.');
  }

  const toes = bones[foot.depth + 1];

  return [upperLeg.bone, lowerLeg.bone, foot.bone, toes?.bone ?? null];
}

/**
 * Determine shoulder, upperArm, lowerArm, and hand.
 *
 * Give it a bone which is a child of chest and supposed to be a root of arm.
 */
function determineArmBones(
  armRoot: THREE.Bone
): [shoulder: THREE.Bone | null, upperArm: THREE.Bone, lowerArm: THREE.Bone, hand: THREE.Bone] {
  const bones: {
    bone: THREE.Bone;
    len: number;
    depth: number;
  }[] = [];

  {
    let currentBone: THREE.Bone | undefined = armRoot;
    let currentDepth = 0;

    while (currentBone != null) {
      const firstChild = currentBone.children[0] as THREE.Bone | undefined;

      bones.push({
        bone: currentBone,
        depth: currentDepth,
        len: firstChild?.position.length() ?? 0.0,
      });

      currentBone = firstChild;
      currentDepth++;
    }
  }

  if (bones.length < 3) {
    throw new Error('Not enough arm bones.');
  }

  const [upperArm, lowerArm] = bones
    .concat()
    .sort((a, b) => b.len - a.len) // sort by bone length, longer comes first
    .slice(0, 2) // pick three longest bones
    .sort((a, b) => a.depth - b.depth); // sort by depth

  const hand = bones[lowerArm.depth + 1];
  if (hand == null) {
    throw new Error('Could not find the foot bone.');
  }

  const shoulder = upperArm.depth !== 0 ? bones[upperArm.depth - 1] : null;

  return [shoulder?.bone ?? null, upperArm.bone, lowerArm.bone, hand.bone];
}

/**
 * Determine neck, head, leftEye, and rightEye.
 *
 * Give it a bone which is a child of chest and supposed to be a root of head.
 */
function determineHeadBones(
  headRoot: THREE.Bone
): [
  neck: THREE.Bone | null,
  head: THREE.Bone,
  leftEye: THREE.Bone | null,
  rightEye: THREE.Bone | null
] {
  let head = headRoot;

  // neck might have two or more bones
  while (head.children.length === 1) {
    head = head.children[0] as THREE.Bone;
  }

  const neck = headRoot === head ? null : headRoot;

  let leftEye: THREE.Bone | null = null;
  let rightEye: THREE.Bone | null = null;

  if (head.children.length >= 2) {
    if (head.children.length > 2) {
      console.warn(
        'The skeleton has more than three children of head. You might get an unexpected result.'
      );
    }

    // assuming z+ is the front, determine left eye and right eye
    const eyeCands = sortObjectArrayByWorldX(head.children.concat() as THREE.Bone[]);
    rightEye = eyeCands.shift()!;
    leftEye = eyeCands.pop()!;
  }

  return [neck, head, leftEye, rightEye];
}

/**
 * Map given hierarchy to VRM humanoid.
 */
export function mapSkeletonToVRM(root: THREE.Bone): Map<VRMHumanBoneName, THREE.Bone> {
  const result = new Map<VRMHumanBoneName, THREE.Bone>();

  // find hips - the first descendant of the root which has three children
  const hips = objectBFS(root, (obj) => {
    return obj.children.length >= 3;
  }) as THREE.Bone;
  if (hips == null) {
    throw new Error('Cannot find hips.');
  }
  result.set('hips', hips as THREE.Bone);

  // find chest candidate - the first descendant of the hips which has three children
  const chestCand = objectBFS(hips, (obj) => {
    return obj !== hips && obj.children.length >= 3;
  }) as THREE.Bone;
  if (chestCand == null) {
    throw new Error('Cannot find chest.');
  }

  const [spine, chest, upperChest] = determineSpineBones(hips, chestCand);
  result.set('spine', spine);
  result.set('chest', chest);
  if (upperChest != null) {
    result.set('upperChest', upperChest);
  }

  // find leg roots - two children of hips extends to below
  if (hips.children.length > 3) {
    console.warn(
      'The skeleton has more than three children of hips. You might get an unexpected result.'
    );
  }

  // assuming z+ is the front, determine left leg and right leg
  const legRootCands = sortObjectArrayByWorldX(hips.children.concat() as THREE.Bone[]);
  const rightLegRoot = legRootCands.shift()!;
  const leftLegRoot = legRootCands.pop()!;

  // determine leg bones
  const [leftUpperLeg, leftLowerLeg, leftFoot, leftToes] = determineLegBones(leftLegRoot);
  result.set('leftUpperLeg', leftUpperLeg);
  result.set('leftLowerLeg', leftLowerLeg);
  result.set('leftFoot', leftFoot);
  if (leftToes != null) {
    result.set('leftToes', leftToes);
  }

  const [rightUpperLeg, rightLowerLeg, rightFoot, rightToes] = determineLegBones(rightLegRoot);
  result.set('rightUpperLeg', rightUpperLeg);
  result.set('rightLowerLeg', rightLowerLeg);
  result.set('rightFoot', rightFoot);
  if (rightToes != null) {
    result.set('rightToes', rightToes);
  }

  // assuming z+ is the front, determine left arm and right arm
  if (chestCand.children.length > 3) {
    console.warn(
      'The skeleton has more than three children of chest. You might get an unexpected result.'
    );
  }

  const armRootCands = sortObjectArrayByWorldX(chestCand.children.concat() as THREE.Bone[]);
  const rightArmRoot = armRootCands.shift()!;
  const leftArmRoot = armRootCands.pop()!;
  const headRoot = armRootCands.pop()!;

  // determine hand bones
  const [leftShoulder, leftUpperArm, leftLowerArm, leftHand] = determineArmBones(leftArmRoot);
  if (leftShoulder != null) {
    result.set('leftShoulder', leftShoulder);
  }
  result.set('leftUpperArm', leftUpperArm);
  result.set('leftLowerArm', leftLowerArm);
  result.set('leftHand', leftHand);

  const [rightShoulder, rightUpperArm, rightLowerArm, rightHand] = determineArmBones(rightArmRoot);
  if (rightShoulder != null) {
    result.set('rightShoulder', rightShoulder);
  }
  result.set('rightUpperArm', rightUpperArm);
  result.set('rightLowerArm', rightLowerArm);
  result.set('rightHand', rightHand);

  // determine head
  const [neck, head, leftEye, rightEye] = determineHeadBones(headRoot);
  if (neck != null) {
    result.set('neck', neck);
  }
  result.set('head', head);
  if (leftEye != null) {
    result.set('leftEye', leftEye);
  }
  if (rightEye != null) {
    result.set('rightEye', rightEye);
  }

  return result;
}