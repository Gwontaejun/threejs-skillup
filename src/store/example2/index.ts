import { atom } from 'recoil';

export const groupIdState = atom<number>({
  key: 'groupIdState',
  default: -1,
});

export const nodeIdState = atom<string>({
  key: 'nodeIdState',
  default: '',
});
