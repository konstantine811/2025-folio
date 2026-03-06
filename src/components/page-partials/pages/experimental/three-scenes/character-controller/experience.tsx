import { useRef } from "react";
import { Mesh } from "three";

const Experience = () => {
    const meshRef = useRef<Mesh>(null);
    return (
        <mesh ref={meshRef}>
            <boxGeometry />
            <meshStandardMaterial color="red" roughness={0} metalness={1} />
        </mesh>
    );
};

export default Experience;