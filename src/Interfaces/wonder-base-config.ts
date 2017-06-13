import { IIdpConfig } from './idp-config';

export interface IWonderBaseConfig {
  autoAccept: Boolean;
  idp: 'webfinger' | IIdpConfig;
  ice: [RTCIceServer]
}
