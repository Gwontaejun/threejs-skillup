import { useEffect, useRef, useState } from "react";
import { Group, Mesh, Vector3 } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";

const Example = () => {
  const [cameraIndex, setCameraIndex] = useState(0);
  const dummyData: number[][] = [
    [2, 2, 2],
    [3, 10, 3],
    [-15, 5, 7],
    [-10, -8, -3],
    [7, -3, 10],
    [11, 7, -5],
  ];

  return (
    <Canvas>
      <OrbitControls
        minDistance={10}
        maxDistance={100000}
        target={new Vector3(...dummyData[cameraIndex])}
      />
      {dummyData.map((group, index: number) => (
        <SphereGroup
          position={new Vector3(...group)}
          isActive={index === cameraIndex}
          onClickGroup={() => setCameraIndex(index)}
        />
      ))}
      {/* <gridHelper /> */}
    </Canvas>
  );
};

const SphereGroup = (props: {
  position: Vector3;
  isActive: boolean;
  onClickGroup: () => void;
}) => {
  const { position, isActive, onClickGroup } = props;
  const sphereRef = useRef<Group>(null);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZVWXYZ";

  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={sphereRef} position={position} onClick={onClickGroup}>
      <mesh>
        <sphereGeometry args={[3.5, 15, 15]} />
        <meshBasicMaterial
          transparent
          opacity={0.1}
          color={isActive ? "red" : "blue"}
          depthTest={false}
        />
      </mesh>
      {alphabet.split("").map((alp, index: number, list: string[]) => {
        const phi = Math.acos(-1 + (2 * index) / list.length);
        const theta = Math.sqrt(list.length * Math.PI) * phi;

        return (
          <BoxMesh
            text={alp}
            position={new Vector3().setFromSphericalCoords(3, phi, theta)}
            groupPosition={position}
          />
        );
      })}
    </group>
  );
};

const BoxMesh = (props: {
  text: string;
  position: Vector3;
  groupPosition: Vector3;
}) => {
  const { text, position, groupPosition } = props;
  const boxRef = useRef<Mesh>(null);

  useEffect(() => {
    if (boxRef.current) {
      const vector = position;
      vector
        .copy(vector)
        .multiplyScalar(
          Math.abs(groupPosition.x) +
            Math.abs(groupPosition.y) +
            Math.abs(groupPosition.z) +
            100
        );
      boxRef.current.lookAt(vector);
    }
  }, []);

  return (
    <mesh ref={boxRef} position={position}>
      <ambientLight intensity={1} />
      <boxGeometry args={[1, 1, 0]} />
      <Text position={[0, 0, 0.01]} color="black" fontSize={0.5}>
        {text}
      </Text>
      <meshBasicMaterial />
    </mesh>
  );
};

export default Example;
