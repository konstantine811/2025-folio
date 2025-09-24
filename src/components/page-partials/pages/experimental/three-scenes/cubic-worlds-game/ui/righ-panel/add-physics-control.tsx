import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";
import { PhysicsData } from "../../store/useEditModeStore";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RigidBodyAutoCollider,
  RigidBodyTypeString,
} from "@react-three/rapier";
import { RigidBodyType, RigidBodyColliders } from "@/types/three/physics.model";
import { SelectItem } from "@radix-ui/react-select";
import NumberInputSlider from "@components/ui-abc/inputs/three-world/number-input-slider";

type Props = {
  editedPhysicsData: PhysicsData | null;
  setEditPhysicsData: (data: PhysicsData | null) => void;
};

const AddPhysicsControl = ({
  editedPhysicsData,
  setEditPhysicsData,
}: Props) => {
  const [checked, setChecked] = useState(editedPhysicsData?.isPhysicsEnabled);
  return (
    <>
      {editedPhysicsData && (
        <div>
          <h2>Add Physics Control</h2>
          <div className="flex items-center gap-2">
            <Label htmlFor="enablePhysics">Enable Physics</Label>
            <Checkbox
              id="enablePhysics"
              checked={checked}
              onCheckedChange={(isChecked) => {
                setChecked(isChecked ? true : false);
                setEditPhysicsData({
                  ...editedPhysicsData,
                  isPhysicsEnabled: isChecked ? true : false,
                });
              }}
            />
          </div>
          <div className="mt-2">
            <Label htmlFor="physicsType">Physics Type</Label>
            <Select
              onValueChange={(value) => {
                setEditPhysicsData({
                  ...editedPhysicsData,
                  type: value as RigidBodyTypeString,
                });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  defaultValue={editedPhysicsData.type}
                  placeholder={editedPhysicsData.type}
                >
                  {editedPhysicsData.type}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.values(RigidBodyType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-2">
            <Select
              onValueChange={(value) => {
                setEditPhysicsData({
                  ...editedPhysicsData,
                  colliders: value as RigidBodyAutoCollider,
                });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  defaultValue={editedPhysicsData.colliders as string}
                  placeholder={editedPhysicsData.colliders}
                >
                  {editedPhysicsData.colliders}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.values(RigidBodyColliders).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-2">
            <NumberInputSlider
              label="Mass"
              value={editedPhysicsData.mass}
              onChange={(value) => {
                setEditPhysicsData({
                  ...editedPhysicsData,
                  mass: value,
                });
              }}
              min={0}
              max={1000}
              step={1}
              precision={0}
            />
          </div>
          <div className="mt-2">
            <NumberInputSlider
              label="Restitution"
              value={editedPhysicsData.restitution}
              onChange={(value) => {
                setEditPhysicsData({
                  ...editedPhysicsData,
                  restitution: value,
                });
              }}
              min={0}
              max={100}
              step={1}
              precision={0}
            />
          </div>
          <div className="mt-2">
            <NumberInputSlider
              label="Friction"
              value={editedPhysicsData.friction}
              onChange={(value) => {
                setEditPhysicsData({
                  ...editedPhysicsData,
                  friction: value,
                });
              }}
              min={0}
              max={50}
              step={1}
              precision={0}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AddPhysicsControl;
