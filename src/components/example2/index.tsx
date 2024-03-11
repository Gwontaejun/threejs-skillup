import { useRef, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { BufferGeometry, Group, Mesh, Vector3 } from 'three';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { Line, OrbitControls, Text } from '@react-three/drei';
import { groupIdState } from '@src/store/example2';

import { SphereDataType } from '@src/type';

import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const testData = [
  {
    id: 1,
    coord: [15, 75, -30],
  },
  {
    id: 2,
    coord: [100, 25, -15],
    parentId: 1,
  },
  {
    id: 3,
    coord: [-25, 50, 50],
    parentId: 1,
  },
];

const Example2 = () => {
  const cameraRef = useRef<OrbitControlsImpl>(null);
  const [groupId, setGroupId] = useRecoilState(groupIdState);

  useEffect(() => {
    setGroupId(testData[0].id);
  }, []);

  const selectItem = testData.find((item) => item.id === groupId);

  return (
    <Canvas>
      <OrbitControls
        ref={cameraRef}
        minDistance={10}
        maxDistance={100000}
        target={selectItem ? new Vector3(...selectItem.coord) : undefined}
      />
      {testData.map((group: SphereDataType) => {
        const parentItem = testData.find((item) => item.id === group.parentId);

        return (
          <SphereGroup
            key={group.id}
            data={group}
            position={new Vector3(...group.coord)}
            parentPosition={
              parentItem ? new Vector3(...parentItem.coord) : undefined
            }
          />
        );
      })}
    </Canvas>
  );
};

const SphereGroup = (props: {
  data: SphereDataType;
  position: Vector3;
  parentPosition: Vector3 | undefined;
}) => {
  const { data, position, parentPosition } = props;
  const lineRef = useRef<BufferGeometry>(null);
  const sphereRef = useRef<Group>(null);
  const [groupId, setGroupId] = useRecoilState(groupIdState);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZVWXYZ';

  useEffect(() => {
    if (parentPosition) {
      const points = [];
      points.push(position);
      points.push(parentPosition);

      lineRef.current?.setFromPoints(points);
    }
  }, []);

  const onClickGroup = (e: ThreeEvent<MouseEvent>) => {
    setGroupId(Number(e.eventObject.name));
  };

  return (
    <>
      <group
        ref={sphereRef}
        name={`${data.id}`}
        position={position}
        onClick={onClickGroup}
        renderOrder={2}
      >
        <mesh>
          <sphereGeometry args={[20, 15, 15]} />
          <meshBasicMaterial
            transparent
            opacity={0.3}
            color={groupId === data.id ? 'red' : 'white'}
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
              position={new Vector3().setFromSphericalCoords(
                Math.ceil(list.length / 4),
                phi,
                theta
              )}
              groupPosition={position}
            />
          );
        })}
      </group>
      {parentPosition && (
        <Line
          points={[position, parentPosition]}
          lineWidth={5}
          color={data.parentId === groupId ? 'red' : '#DBDBDB'}
          vertexColors={
            data.parentId === groupId
              ? [
                  [0, 0, 0],
                  [1, 23, 1],
                ]
              : [
                  [255, 255, 255],
                  [255, 255, 255],
                ]
          }
        />
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
  //   const [nodeId, setNodeId] = useRecoilState(nodeIdState);

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

  const onClickNode = (e: ThreeEvent<MouseEvent>) => {
    console.log('ONCLICK!!', e);
    // setNodeId(e.eventObject.name);
  };

  return (
    <mesh
      ref={boxRef}
      position={position}
      onClick={onClickNode}
      renderOrder={1}
    >
      <ambientLight intensity={1} />
      <sphereGeometry args={[1, 15, 15]} />
      <Text position={[0, 0, 1]} color="black" fontSize={1} renderOrder={1}>
        {text}
      </Text>
      <meshBasicMaterial depthTest={false} transparent />
      {/* <Outlines color="blue" scale={1.2} /> */}
    </mesh>
  );
};

export default Example2;
