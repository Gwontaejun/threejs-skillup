import { useEffect, useRef, useState } from 'react';
import { BufferGeometry, Group, Mesh, Vector3 } from 'three';
import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber';
import { Line, OrbitControls, Text } from '@react-three/drei';

import { SphereDataType } from '@src/type';

const Example = () => {
  const [cameraIndex, setCameraIndex] = useState(0);
  const dummyData: SphereDataType[] = [
    {
      id: 1,
      coord: [2, 2, 2],
    },
    {
      id: 2,
      coord: [3, 10, 3],
      parentId: 1,
    },
    {
      id: 3,
      coord: [-15, 5, 7],
      parentId: 1,
    },
    {
      id: 4,
      coord: [-10, -8, -3],
      parentId: 1,
    },
    {
      id: 5,
      coord: [7, -3, 10],
      parentId: 1,
    },
    {
      id: 6,
      coord: [11, 7, -5],
      parentId: 1,
    },
  ];

  const onClickGroup = (e: ThreeEvent<MouseEvent>, index: number) => {
    e.stopPropagation();
    setCameraIndex(index);
  };

  return (
    <Canvas>
      <OrbitControls
        minDistance={10}
        maxDistance={100000}
        target={new Vector3(...dummyData[cameraIndex].coord)}
      />
      {dummyData.map((group: SphereDataType, index: number) => {
        const parentItem = dummyData.find((item) => item.id === group.parentId);

        return (
          <SphereGroup
            key={group.id}
            position={new Vector3(...group.coord)}
            parentPosition={
              parentItem ? new Vector3(...parentItem.coord) : undefined
            }
            isActive={index === cameraIndex}
            onClickGroup={(e: ThreeEvent<MouseEvent>) => onClickGroup(e, index)}
          />
        );
      })}
      {/* <gridHelper /> */}
    </Canvas>
  );
};

const SphereGroup = (props: {
  position: Vector3;
  parentPosition: Vector3 | undefined;
  isActive: boolean;
  onClickGroup: (e: ThreeEvent<MouseEvent>) => void;
}) => {
  const { position, parentPosition, isActive, onClickGroup } = props;
  const lineRef = useRef<BufferGeometry>(null);
  const sphereRef = useRef<Group>(null);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZVWXYZ';

  useEffect(() => {
    if (parentPosition) {
      const points = [];
      points.push(position);
      points.push(parentPosition);

      lineRef.current?.setFromPoints(points);
    }
  }, []);

  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.01;
    }
  });

  return (
    <>
      <group ref={sphereRef} position={position} onClick={onClickGroup}>
        <mesh>
          <sphereGeometry args={[3.5, 15, 15]} />
          <meshBasicMaterial
            transparent
            opacity={0.1}
            color={isActive ? 'red' : 'blue'}
            depthTest={false}
          />
        </mesh>
        {alphabet.split('').map((alp, index: number, list: string[]) => {
          const phi = Math.acos(-1 + (2 * index) / list.length);
          const theta = Math.sqrt(list.length * Math.PI) * phi;

          return (
            <BoxMesh
              key={`${alp}-${index}`}
              text={alp}
              position={new Vector3().setFromSphericalCoords(3, phi, theta)}
              groupPosition={position}
            />
          );
        })}
      </group>
      {parentPosition && (
        <Line points={[position, parentPosition]} lineWidth={5} color="red" />
      )}
    </>
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
