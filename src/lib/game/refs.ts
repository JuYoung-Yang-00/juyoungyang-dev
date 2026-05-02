import { Object3D } from "three";

// Module-level mutable ref shared between PlayerCharacter (writer) and
// CameraRig (reader). Using a shared Object3D avoids re-renders that a
// store-based approach would trigger every frame.
export const playerObj = new Object3D();
playerObj.position.set(0, 0, 0);
