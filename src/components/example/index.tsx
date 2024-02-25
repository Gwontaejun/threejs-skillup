import { useEffect, useRef } from "react";
import { Mesh, Vector3 } from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";

const Example = () => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZVWXYZ";

  return (
    <Canvas>
      <OrbitControls />
      {alphabet.split("").map((alp, index: number, list: string[]) => {
        const phi = Math.acos(-1 + (2 * index) / list.length);
        const theta = Math.sqrt(list.length * Math.PI) * phi;

        return (
          <BoxMesh
            text={alp}
            position={new Vector3().setFromSphericalCoords(3, phi, theta)}
          />
        );
      })}
      <gridHelper />
    </Canvas>
  );
};

const BoxMesh = (props: { text: string; position: Vector3 }) => {
  const { text, position } = props;
  const boxRef = useRef<Mesh>(null);

  useEffect(() => {
    if (boxRef.current) {
      const vector = new Vector3();
      vector.copy(boxRef.current.position).multiplyScalar(2);
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
