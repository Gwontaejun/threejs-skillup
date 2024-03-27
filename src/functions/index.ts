import { SphereDataType } from '@src/type';
import { Vector3 } from 'three';

export const overlapCalcPosition = (
  parentPosition: number[],
  distance: number,
  phi: number,
  theta: number,
  list: SphereDataType[],
  item: SphereDataType
) => {
  const position = new Vector3(...parentPosition).setFromSphericalCoords(
    distance,
    phi,
    theta
  );

  const overlaps = list.find(
    (value) =>
      new Vector3(...value.coord).distanceTo(position) < item!.child!.length * 2
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
