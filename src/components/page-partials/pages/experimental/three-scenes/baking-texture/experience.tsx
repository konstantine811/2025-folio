import { useRef } from "react";
import { Mesh } from "three";

const Experience = () => {
    const meshRef = useRef<Mesh>(null);
    return (
        <mesh ref={meshRef}>
            <boxGeometry />
        </mesh>
    );
};

export default Experience;