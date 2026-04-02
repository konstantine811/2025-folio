import { JSX } from 'react'
import { useGLTF } from '@react-three/drei'
import {type Mesh } from 'three'

export function ShipFloor(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF('/3d-models/sci-fi/ship-floor.glb')
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.ship_floor as Mesh).geometry}
        material={materials.floor}
        position={[0, 0.057, 0]}
      />
    </group>
  )
}

useGLTF.preload('/3d-models/sci-fi/ship-floor.glb')