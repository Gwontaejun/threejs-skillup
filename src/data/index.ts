import { SphereDataType } from '@src/type';

export const sphereData: SphereDataType[] = [
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
  {
    id: 7,
    coord: [20, 5, -15],
    parentId: 6,
  },
  {
    id: 8,
    coord: [9, 20, 5],
    parentId: 3,
  },
  {
    id: 9,
    coord: [15, 19, 1],
    parentId: 2,
  },
  {
    id: 10,
    coord: [15, 30, 20],
    parentId: 5,
  },
  {
    id: 11,
    coord: [25, 11, 9],
    parentId: 4,
  },
  {
    id: 12,
    coord: [1, 21, -5],
    parentId: 11,
  },
  {
    id: 13,
    coord: [17, 21, -11],
    parentId: 3,
  },
  {
    id: 14,
    coord: [25, 24, -5],
    parentId: 13,
  },
];
