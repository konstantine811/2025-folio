import { CrowdAgent, Vector3Tuple } from "recast-navigation";
import { Agent } from "../crowd-agent";
import { MaleModel } from "./male";
import {
  Component,
  Entity,
} from "@components/page-partials/pages/experimental/three-scenes/cubic-worlds-game/enemy/entity-component-store";
import { useEffect, useRef } from "react";

type FollowerProps = {
  position: Vector3Tuple;
};

const Follower = (props: FollowerProps) => {
  const radius = 0.5;
  const height = 0.5;
  const agentRef = useRef<CrowdAgent>(null);
  const agentProps = {
    initialPosition: props.position,
    radius,
    height,
    maxAcceleration: 5.5,
    maxSpeed: 5.5,
  };
  useEffect(() => {
    console.log("crowd agent", agentRef);
  }, []);
  return (
    <Entity followPlayer>
      <Component name="crowdAgent">
        <Agent
          ref={agentRef}
          {...agentProps}
          // onCreateAgent={(agent) => {
          //   console.log("agent", agent);
          // }}
        />
      </Component>
      <Component name="three">
        <group>
          <MaleModel position-y={0.5} scale={0.5} />

          {/* <mesh position-y={1}>
                        <capsuleGeometry args={[radius, height, 12]} />
                        <meshStandardMaterial color="red" />
                    </mesh> */}
        </group>
      </Component>
    </Entity>
  );
};

export default Follower;
