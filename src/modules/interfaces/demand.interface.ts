export interface IDemand {
  in?: IDemandSingleDirection;
  out?: IDemandSingleDirection;
}

export interface IDemandSingleDirection {
  audio?: boolean;
  video?: boolean;
  data?: boolean | string;
}
