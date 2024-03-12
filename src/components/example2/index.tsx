/* eslint-disable import/extensions */
import { useRef, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  AdditiveBlending,
  BufferGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3DEventMap,
  SphereGeometry,
  Vector3,
} from 'three';
import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber';
import { Line, OrbitControls, Text } from '@react-three/drei';
import { groupIdState } from '@src/store/example2';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Line2 } from 'three/examples/jsm/Addons.js';

import { SphereDataType } from '@src/type';
import { sphereGroupData } from '@src/data';

const Example2 = () => {
  const cameraRef = useRef<OrbitControlsImpl>(null);
  const [data, setData] = useState<SphereDataType[]>([]);
  const [groupId, setGroupId] = useRecoilState(groupIdState);

  useEffect(() => {
    setData(sphereGroupData);
    setGroupId(sphereGroupData[0].id);
  }, []);

  const selectItem = data.find((item) => item.id === groupId);

  return (
    <>
      <h2 style={{ display: 'block', textAlign: 'center' }}>
        현재 선택한 그룹 : {groupId}
      </h2>
      <Canvas
        style={{
          width: 1300,
          height: 800,
          background: '#fff',
          margin: 'auto',
        }}
      >
        <OrbitControls
          ref={cameraRef}
          minDistance={10}
          maxDistance={100000}
          target={selectItem ? new Vector3(...selectItem.coord) : undefined}
        />
        {data.map((group: SphereDataType) => {
          const parentItem = data.find((item) => item.id === group.parentId);

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
    </>
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
        <TrackingLine
          position={[position.x, position.y, position.z]}
          parentPosition={[
            parentPosition.x,
            parentPosition.y,
            parentPosition.z,
          ]}
        />
      )}
    </>
  );
};

const TrackingLine = (props: {
  position: number[];
  parentPosition: number[];
}) => {
  const { position, parentPosition } = props;
  const lineRef = useRef<Line2>(null);
  const groupRef = useRef<Group<Object3DEventMap>>(null);

  const entriePoint = new Vector3(...parentPosition);
  const endPoint = new Vector3(...position);

  useEffect(() => {
    if (lineRef.current) {
      const particle = new SphereGeometry(1, 32, 16);
      const pMaterial = new MeshBasicMaterial({
        color: 'red',
        blending: AdditiveBlending,
        transparent: true,
      });

      // 연결 선에 파티클 생성하여 추가
      for (let i = 0; i <= 15; i++) {
        const particlePosition = entriePoint.lerp(endPoint, i / 15);
        const mesh = new Mesh(particle, pMaterial);
        mesh.position.set(
          particlePosition.x,
          particlePosition.y,
          particlePosition.z
        );

        groupRef.current?.add(mesh);
      }
    }
  }, []);

  useFrame(() => {
    groupRef.current?.children.forEach((item) => {
      const path = item.position;

      // 파티클의 path가 끝점 거리 비율 5 미만이라면 초기로 이동
      if (path.distanceTo(endPoint) < 5) {
        // x, y, z
        path.set(parentPosition[0], parentPosition[1], parentPosition[2]);
      }

      // 프레임마다 파티클을 끝점으로 이동
      path.lerp(endPoint, 0.01);
    });
  });

  return (
    <>
      <Line ref={lineRef} points={[entriePoint, endPoint]} lineWidth={2} />
      <group ref={groupRef} />
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
    </mesh>
  );
};

export default Example2;
