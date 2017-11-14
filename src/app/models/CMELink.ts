import { CMCoor } from './CMCoor';

export class CMELink {
  public id: number;
  public targetId: number;
  public title: string;
  public peerCoor: CMCoor;
  public weight: number;
  public con: string;
  public start: boolean;
}
