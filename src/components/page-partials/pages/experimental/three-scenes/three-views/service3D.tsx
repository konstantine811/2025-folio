import { ContactShadows, Environment, Float } from "@react-three/drei";
import ItemModel from "./item-model";
import { ModelNames } from "./config";
import { degToRad } from "three/src/math/MathUtils.js";

const Service3D = ({ currentService }: { currentService: number }) => {
  return (
    <>
      <group visible={currentService === 0}>
        <Float position-z={-1.2} speed={1.8}>
          <ItemModel
            modelName={ModelNames.phone}
            props={{
              scale: 0.6,
              position: [-0.22, 0.02, 0],
              rotation: [degToRad(-15), degToRad(22), 0],
            }}
          />
        </Float>
        <Float position-z={-3}>
          <ItemModel
            modelName={ModelNames.macBook}
            props={{
              position: [0.22, 0, 0],
              rotation: [0, degToRad(-22), degToRad(-15)],
              scale: 0.32,
            }}
          ></ItemModel>
        </Float>
      </group>
      <group visible={currentService === 1}>
        <Float position-z={-1}>
          <ItemModel
            modelName={ModelNames.vr}
            props={{
              scale: 0.5,
              position: [0, 0.15, 0],
              rotation: [0, degToRad(-70), 0],
            }}
          />
        </Float>
        <Float
          position={[0.35, -0.1, -0.5]}
          rotationIntensity={2.4}
          speed={2.8}
          floatIntensity={0.5}
        >
          <ItemModel
            modelName={ModelNames.oculus}
            props={{ scale: 0.05, rotation: [0, degToRad(45), 0] }}
          />
        </Float>
        <Float
          position={[-0.25, -0.2, -0.1]}
          rotationIntensity={2}
          speed={2.5}
          floatIntensity={0.6}
        >
          <ItemModel
            modelName={ModelNames.oculus}
            props={{ scale: 0.05, rotation: [0, degToRad(45), 0] }}
          />
        </Float>
      </group>
      <group visible={currentService !== 2} position-y={-0.5}>
        <ContactShadows />
      </group>
      <group visible={currentService === 2}>
        <Float
          rotationIntensity={0}
          floatIntensity={0.5}
          position={[0.1, -0.15, 0]}
        >
          <ItemModel
            modelName={ModelNames.classRoom}
            props={{ scale: 0.5, rotation: [0, degToRad(-5), 0] }}
          />
        </Float>
      </group>
      <Environment preset="sunset" />
    </>
  );
};

export default Service3D;
