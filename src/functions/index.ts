import { SphereDataType } from '@src/type';
import { Vector3 } from 'three';

// 제네릭으로 타입지정을 하여, 함수 호출시점에 타입지정을 하여 빌드타입 에러를 제거시킴
export const overlapCalcPosition = <T>(
  parentPosition: number[],
  distance: number,
  phi: number,
  theta: number,
  list: SphereDataType[],
  item: SphereDataType
): T | Vector3 => {
  const position = new Vector3(...parentPosition).setFromSphericalCoords(
    distance,
    phi,
    theta
  );

  const overlaps = list.find(
    (value) =>
      new Vector3(...value.coord).distanceTo(position) <
      item!.child!.length * 10
  );

  if (overlaps) {
    return overlapCalcPosition(
      parentPosition,
      distance + 1,
      phi,
      theta,
      list,
      item
    );
  }

  return position;
};
