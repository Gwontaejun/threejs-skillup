/* eslint-disable import/extensions */
import { useRef, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  BufferGeometry,
  Color,
  CubeTextureLoader,
  DirectionalLight,
  DirectionalLightHelper,
  Group,
  Mesh,
  Object3DEventMap,
  Vector3,
} from 'three';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Line, OrbitControls, Text, Trail, useHelper } from '@react-three/drei';
import { groupIdState } from '@src/store/example2';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Line2 } from 'three/examples/jsm/Addons.js';

import { SphereDataType } from '@src/type';
import { sphereGroupData } from '@src/data';
import { Bloom, EffectComposer } from '@react-three/postprocessing';

const Example2 = () => {
  return (
    <Canvas shadows>
      {/* <pointLight position={[0, 20, 10]} intensity={1.5} /> */}
      {/* <ambientLight intensity={30} color="#red" /> */}

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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  useHelper(lightRef, DirectionalLightHelper, 3, 'red');

  useEffect(() => {
    setData(sphereGroupData);
    setGroupId(sphereGroupData[0].id);
    loadSkyBox();
    if (lightRef.current) {
      lightRef.current.shadow.mapSize.width = 1200; // Better readjust after changing directionalLight1.shadow.camera » top bottom left right
      lightRef.current.shadow.mapSize.height = 1200; // Better readjust after changing directionalLight1.shadow.camera » top bottom left right
      lightRef.current.shadow.camera.near = 0.1; // Near shadow casting distance
      lightRef.current.shadow.camera.far = 100; // Far shadow casting distance
      lightRef.current.shadow.camera.top = 11;
      lightRef.current.shadow.camera.bottom = -11;
      lightRef.current.shadow.camera.left = -11;
      lightRef.current.shadow.camera.right = 11;
    }
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
        position={[200, 200, 200]}
        intensity={1}
        castShadow
      />
      <axesHelper />
      <gridHelper />
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
          width={10}
          length={6}
          color={new Color(2, 1, 10)}
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
        renderOrder={1}
      />
      <group ref={groupRef}>{generateParticles(5)}</group>
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
      <sphereGeometry args={[1, 15, 15]} />
      <Text position={[0, 0, 1]} color="black" fontSize={1} renderOrder={1}>
        {text}
      </Text>
      <meshBasicMaterial depthTest={false} transparent />
    </mesh>
  );
};

export default Example2;
