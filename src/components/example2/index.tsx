/* eslint-disable import/extensions */
import { useRef, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  BufferGeometry,
  Color,
  CubeTextureLoader,
  DirectionalLight,
  Group,
  Mesh,
  Object3DEventMap,
  Vector3,
} from 'three';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Line, OrbitControls, Text, Trail } from '@react-three/drei';
import { groupIdState, nodeIdState } from '@src/store/example2';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Line2 } from 'three/examples/jsm/Addons.js';
import { overlapCalcPosition } from '@src/functions';

import { SphereDataType } from '@src/type';
import { sphereGroupData } from '@src/data';
import { Bloom, EffectComposer } from '@react-three/postprocessing';

const Example2 = () => {
  return (
    <Canvas shadows>
      {/* <pointLight position={[0, 20, 10]} intensity={1.5} /> */}
      <ambientLight intensity={0.3} color="white" />
      <SkyboxWrapper />
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={1} radius={0.7} />
      </EffectComposer>
    </Canvas>
  );
};

const SkyboxWrapper = () => {
  const { scene } = useThree();
  const lightRef = useRef<DirectionalLight>(null);
  const cameraRef = useRef<OrbitControlsImpl>(null);
  const [data, setData] = useState<SphereDataType[]>([]);
  const [groupId, setGroupId] = useRecoilState(groupIdState);

  useEffect(() => {
    const sphereData = sphereGroupData.reduce(
      (result: SphereDataType[], item: SphereDataType, index: number) => {
        let position = new Vector3(0, 0, 0);

        const parentItem = sphereGroupData.find(
          (value) => value.id === item.parentId
        );

        if (index > 0) {
          const parentPosition = result.find(
            (value) => value.id === item.parentId
          )!.coord;

          const phi = Math.acos(
            -1 + ((2 * index) / parentItem!.child.length) * 2
          );
          const theta = Math.sqrt(parentItem!.child.length * 2 * Math.PI) * phi;

          position = overlapCalcPosition(
            parentPosition,
            parentItem!.child.length * 3,
            phi,
            theta,
            result,
            item
          );
        }

        return [
          ...result,
          { ...item, coord: [position.x, position.y, position.z] },
        ];
      },
      []
    );

    setData(sphereData);
    setGroupId(sphereData[0].id);
    loadSkyBox();
  }, []);

  const loadSkyBox = () => {
    const textureLoader = new CubeTextureLoader();
    const texture = textureLoader
      .setPath('./texture/skybox/')
      .load([
        'corona_rt.png',
        'corona_lf.png',
        'corona_up.png',
        'corona_dn.png',
        'corona_bk.png',
        'corona_ft.png',
      ]);

    scene.background = texture;
    scene.environment = texture;
  };

  const selectItem = data.find((item) => item.id === groupId);

  return (
    <>
      <OrbitControls
        ref={cameraRef}
        minDistance={10}
        maxDistance={100000}
        target={selectItem ? new Vector3(...selectItem.coord) : undefined}
      />
      <directionalLight
        ref={lightRef}
        position={[300, 450, 0]}
        intensity={1}
        castShadow
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
        renderOrder={1}
        castShadow
        receiveShadow
      >
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[5, 15, 15]} />
          <Text position={[0, 7, 0]} color="white" fontSize={4}>
            TEAM
          </Text>
          <meshStandardMaterial
            color={groupId === data.id ? 'red' : 'white'}
            depthTest
          />
        </mesh>
        {data.child?.map(
          (
            item: { id: string; text: string },
            index: number,
            list: { id: string; text: string }[]
          ) => {
            const listLength = list.length < 30 ? 30 : list.length;

            // const phi = Math.acos(-1 + (2 * index) / listLength);
            // const theta = Math.sqrt(listLength * Math.PI) * phi;
            const phi = Math.acos(-1 + (2 * index) / listLength);
            const theta = Math.sqrt(listLength * Math.PI) * phi;

            const calcPosition = new Vector3().setFromSphericalCoords(
              index % 2 === 0 ? -listLength : listLength,
              phi,
              theta
            );

            return (
              <BoxMesh
                key={`${item.id}-${index}`}
                id={item.id}
                text={item.text}
                position={calcPosition}
                groupPosition={position}
              />
            );
          }
        )}
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

  useFrame(() => {
    groupRef.current?.children.forEach((item) => {
      const path = item.children[0].children[0].position;

      // 파티클의 path가 끝점 거리 비율 5 미만이라면 초기로 이동
      if (path.distanceTo(endPoint) < 5) {
        // x, y, z
        path.set(parentPosition[0], parentPosition[1], parentPosition[2]);
      }

      // 프레임마다 파티클을 끝점으로 이동
      path.lerp(endPoint, 0.02);
    });
  });

  const generateParticles = (count: number) => {
    const particles = [];

    // 연결 선에 파티클 생성하여 추가
    for (let i = 0; i <= count; i++) {
      const particlePosition = entriePoint.lerp(endPoint, i / 15);
      const particle = (
        // Trail 컴포넌트를 사용하여 상하구조 관계 흐름을 ui에 표시
        <Trail
          width={15}
          length={6}
          color={new Color(15, 1, 1)}
          attenuation={(t) => t * t}
        >
          <mesh
            position={[
              particlePosition.x,
              particlePosition.y,
              particlePosition.z,
            ]}
          >
            {/* <sphereGeometry args={[1, 15, 15]} /> */}
            <meshBasicMaterial color={[10, 1, 10]} transparent />
          </mesh>
        </Trail>
      );
      particles.push(particle);
    }

    return particles;
  };

  return (
    <>
      <Line
        ref={lineRef}
        points={[...parentPosition, ...position]}
        lineWidth={1}
        renderOrder={2}
      />
      <group ref={groupRef}>{generateParticles(5)}</group>
    </>
  );
};

const BoxMesh = (props: {
  id: string;
  text: string;
  position: Vector3;
  groupPosition: Vector3;
}) => {
  const { id, text, position, groupPosition } = props;
  const boxRef = useRef<Mesh>(null);
  const [nodeId, setNodeId] = useRecoilState(nodeIdState);

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

  const onClickNode = () => {
    setNodeId(id);
  };

  const normal = new Color(1, 1, 4);
  const active = new Color(4, 1, 1);

  return (
    <mesh
      ref={boxRef}
      position={position}
      onClick={onClickNode}
      renderOrder={1}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[1, 15, 15]} />
      <Text position={[0, 2, 1]} color="white" fontSize={1.5} renderOrder={1}>
        {text}
      </Text>
      <meshBasicMaterial color={id === nodeId ? active : normal} />
    </mesh>
  );
};

export default Example2;
