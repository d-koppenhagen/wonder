export interface IDemand {
  in?: IDemandSingleDirection;
  out?: IDemandSingleDirection;
}

export interface IDemandSingleDirection {
  audio?: Boolean;
  video?: Boolean;
  data?: Boolean | string;
}
