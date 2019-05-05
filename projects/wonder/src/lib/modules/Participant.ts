import { Wonder } from '../wonder';
import { Identity } from './Identity';
import { Demand } from './Demand';
import { IDemand } from './interfaces';

export class Participant {
  peerConnection: RTCPeerConnection = null;

  constructor(
    public wonderInstance: Wonder,
    public identity: Identity,
    public demand: IDemand
  ) { }

  getRtcPeerConnection(): RTCPeerConnection {
    return this.peerConnection;
  }

  setRtcPeerConnection(rtcPeerConnection: RTCPeerConnection) {
    this.peerConnection = rtcPeerConnection;
    this.peerConnection.ontrack = this.wonderInstance.conversations[0]
      .rtcEvtHandler.onEvt.bind(this.wonderInstance.conversations[0].rtcEvtHandler);
    this.peerConnection.onicecandidate = this.wonderInstance.conversations[0]
      .rtcEvtHandler.onEvt.bind(this.wonderInstance.conversations[0].rtcEvtHandler);
    this.peerConnection.oniceconnectionstatechange = this.wonderInstance.conversations[0]
      .rtcEvtHandler.onEvt.bind(this.wonderInstance.conversations[0].rtcEvtHandler);
  }

  updateDemand(demand: IDemand) {
    this.demand = new Demand(demand).updateDemandAllow(this.demand, demand);
  }
}
