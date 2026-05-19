import { RefObject } from "react";
import { Group } from "three";
import { BoneAttachment } from "../character-attachment/bone-attacment";
import { Sword } from "../character-attachment/sword";
import { WeaponAttachmentConfig } from "../models/weapon-attachment.model";

interface WeaponAttachmentProps extends WeaponAttachmentConfig {
  parentScene: Group;
  weaponAttachmentRef?: RefObject<Group | null>;
}

export function WeaponAttachment({
  parentScene,
  weaponAttachmentRef,
  modelPath,
  position,
  rotation,
  scale,
}: WeaponAttachmentProps) {
  return (
    <BoneAttachment
      ref={weaponAttachmentRef}
      parentScene={parentScene}
      boneName="mixamorigRightHand"
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <Sword modelPath={modelPath} />
    </BoneAttachment>
  );
}
