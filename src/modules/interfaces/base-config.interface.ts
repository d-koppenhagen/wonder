import { IIdpConfig } from './idp-config.interface';

export interface IBaseConfig {
  autoAccept: Boolean;
  idp: 'webfinger' | IIdpConfig;
  ice: [RTCIceServer]
}
