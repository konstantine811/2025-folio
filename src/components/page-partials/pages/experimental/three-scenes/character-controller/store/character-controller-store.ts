import { RefObject } from "react";
import { Group } from "three";

export type CharacterControllerState = {
  isMoving: boolean;
  isSprinting: boolean;
  isGrounded: boolean;
  velocity: {
    x: number;
    y: number;
    z: number;
  };
  moveSpeed: number;
  jumpForce: number;
  airControl: number;
};

export type CharacterRenderProps = {
  modelRef: RefObject<Group | null>;
  weaponAttachmentRef: RefObject<Group | null>;
  controllerState: CharacterControllerState;
};
