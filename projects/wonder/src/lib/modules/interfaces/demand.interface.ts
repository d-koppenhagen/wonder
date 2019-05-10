export interface IDemand {
  in?: IDemandSingleDirection;
  out?: IDemandSingleDirection;
}

export interface IDemandSingleDirection {
  audio?: boolean | { [key: string]: any };
  video?: boolean | { [key: string]: any };
  data?: boolean | string;
}

export type AudioVideoDataAll = 'audio' | 'video' | 'data' | 'all' | '';
export type AudioVideoDataType = 'audio' | 'video' | 'data';

export type RawDemand =
  AudioVideoDataAll |
  AudioVideoDataType[] |
  { [key in AudioVideoDataType]: any };
