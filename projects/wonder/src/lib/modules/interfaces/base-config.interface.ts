import { IIdpConfig } from './idp-config.interface';

export interface IBaseConfig {
  autoAccept: boolean;
  idp: 'webfinger' | IIdpConfig;
  ice: RTCIceServer[];
}
