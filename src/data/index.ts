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
    coord: [15, 21, 5],
    parentId: 2,
  },
  {
    id: 8,
    coord: [-5, 25, 5],
    parentId: 2,
  },
  {
    id: 9,
    coord: [3, 22, 15],
    parentId: 2,
  },
  {
    id: 10,
    coord: [21, 35, 10],
    parentId: 7,
  },
  {
    id: 11,
    coord: [30, 25, 15],
    parentId: 7,
  },
  {
    id: 12,
    coord: [30, 25, -10],
    parentId: 7,
  },
  {
    id: 13,
    coord: [-15, 30, 10],
    parentId: 8,
  },
  {
    id: 13,
    coord: [-15, 30, -15],
    parentId: 8,
  },
  {
    id: 14,
    coord: [15, 30, 30],
    parentId: 9,
  },
  {
    id: 14,
    coord: [-15, 30, 30],
    parentId: 9,
  },
  {
    id: 101,
    coord: [50, 50, 50],
  },
  {
    id: 102,
    coord: [40, 60, 55],
    parentId: 101,
  },
  {
    id: 103,
    coord: [70, 66, 59],
    parentId: 101,
  },
  {
    id: 104,
    coord: [30, 50, 80],
    parentId: 101,
  },
  {
    id: 105,
    coord: [60, 50, 30],
    parentId: 101,
  },
  {
    id: 106,
    coord: [10, 50, 100],
    parentId: 104,
  },
  {
    id: 107,
    coord: [10, 70, 100],
    parentId: 104,
  },
  {
    id: 108,
    coord: [30, 70, 80],
    parentId: 104,
  },
  {
    id: 109,
    coord: [50, 70, 80],
    parentId: 104,
  },
  {
    id: 110,
    coord: [80, 70, 80],
    parentId: 109,
  },
  {
    id: 111,
    coord: [70, 70, 100],
    parentId: 109,
  },
];
