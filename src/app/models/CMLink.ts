import { CMCoor } from './CMCoor';

export class CMLink {
  id: number;
  target_id: number;
  title: string;
  peer_coor: CMCoor;
  weight: number;
  con: string;
  link_coor: CMCoor;
  start: boolean;
}
