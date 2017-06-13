export interface IDemand {
  in?: IDemandDirection;
  out?: IDemandDirection;
}

export interface IDemandDirection {
  audio?: Boolean;
  video?: Boolean;
  data?: Boolean | string;
}
