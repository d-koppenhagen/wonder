import { Wonder } from '../wonder';
import { Identity } from './Identity';
import { Demand } from './Demand';
import { IDemand } from './interfaces';

/**
 * @desc This class represents a participant of a conversation.
 * Identities can be stored in multiple participants but participants
 * with the same identity cannot be in the same conversation.
 */
export class Participant {
  /**
   * @desc Used to hold the RTCPeerConnection to this participant
   */
  peerConnection: RTCPeerConnection = null;

  constructor(
    /**
     * @desc Backreference to the WONDER instance
     */
    public wonderInstance: Wonder,

    /**
     * @desc The identity of the participant
     */
    public identity: Identity,

    /**
     * @desc The resources a participant demands for the communication
     */
    public demand: IDemand
  ) { }

  /**
   * @desc Sets the RtcPeerConnection of this participant
   */
  setRtcPeerConnection(rtcPeerConnection: RTCPeerConnection) {
    this.peerConnection = rtcPeerConnection;
    this.peerConnection.ontrack = this.wonderInstance.conversations[0]
      .rtcEvtHandler.onEvt.bind(this.wonderInstance.conversations[0].rtcEvtHandler);
    this.peerConnection.onicecandidate = this.wonderInstance.conversations[0]
      .rtcEvtHandler.onEvt.bind(this.wonderInstance.conversations[0].rtcEvtHandler);
    this.peerConnection.oniceconnectionstatechange = this.wonderInstance.conversations[0]
      .rtcEvtHandler.onEvt.bind(this.wonderInstance.conversations[0].rtcEvtHandler);
  }

  /**
   * @desc This function updates the demand by adding the new demand to the existing demand
   */
  updateDemand(demand: IDemand) {
    this.demand = new Demand(demand).updateDemandAllow(this.demand, demand);
  }
}
