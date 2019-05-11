import { Wonder } from '../wonder';
import { guid } from './helpfunctions';
import { Identity } from './Identity';
import { Participant } from './Participant';
import { MsgEvtHandler } from './MsgEvtHandler';
import { RtcEvtHandler } from './RtcEvtHandler';
import { DataChannelEvtHandler } from './DataChannelEvtHandler';
import { IMessagingStub } from './interfaces';
import { DataChannelBroker } from './DataChannelBroker';

/**
 * @desc This class is the central class for controlling conversations
 */
export class Conversation {
  /**
   * @desc A unique identifier for a conversation which is created automatically
   */
  id: string = guid();

  /**
   * @desc The local participant of the conversation
   */
  myParticipant: Participant = null;

  /**
   * @desc An array of all remote {@link Participant}s participating in that conversation
   */
  remoteParticipants: Participant[] = [];

  /**
   * @desc The message event handler instance of the conversation which handles all incoming messages
   * from the conversation's messaging server
   * @example conversation.msgEvtHandler = new MsgEvtHandler(wonderInstance, conversation);
   */
  msgEvtHandler: MsgEvtHandler;

  /**
   * @desc The rtc event handler instance of the conversation which handles all events related to a rtc peer connection#
   * @TODO Move this to the Participant-class as a peer connection is established to another participant.
   * This needs to be done and working before multiparty code is written.
   * @example conversation.rtcEvtHandler = new RtcEvtHandler(wonderInstance, conversation);
   */
  rtcEvtHandler: RtcEvtHandler;

  /**
   * @desc The data cannel event handler for data channel events of a specific channel.
   * The event handler is registered only if a data channel is required.
   * @TODO check if this isn't needed anymore as the codec has the handler
   * @example conversation.dataChannelEvtHandler = new dataChannelEvtHandler(wonderInstance, conversation);
   */
  dataChannelEvtHandler: DataChannelEvtHandler = null;

  /**
   * @desc The messaging stub implementation instance of the messaging server which is used in this conversation
   */
  msgStub: IMessagingStub = null;

  /**
   * @desc A URL as a string to a messaging server which is used in this conversation
   */
  msgSrv: string = null;

  /**
   * @desc The broker which stores and handles codecs and its data channels which are used in this conversation
   */
  dataChannelBroker: DataChannelBroker = null;


  constructor(
    /**
     * @desc The wonder instance on which the conversation is located on
     * @desc Makes backreferences possible
     */
    public wonderInstance: Wonder,

    /**
     * @desc The participant who owns the conversation which is usually the caller
     */
    public owner?: Participant
  ) {
    this.msgEvtHandler = new MsgEvtHandler(this.wonderInstance, this);
    this.rtcEvtHandler = new RtcEvtHandler(this.wonderInstance, this);
  }

  /**
   * @desc Leaves the conversation on which the function is executed on
   * @example conversation.leave();
   */
  leave() {
    if (this.myParticipant && this.myParticipant.peerConnection) {
      this.myParticipant.peerConnection.close();
    }
    this.remoteParticipants.forEach((participant: Participant) => {
      // this will trigger the iceconnectionstatechange event on the remote end
      // remote end needs to check pc.iceConnectionState == disconnected
      if (participant.peerConnection) {
        participant.peerConnection.close();
      }
      // as the message is delivered trough the pc event a separate message isn't mandatory here
    });
    if (this.msgStub) {
      this.msgStub.disconnect(); // now disconnect from the remote messaging server
    }
  }

  /**
   * @desc Adds a new remote participant to the conversation
   */
  addRemoteParticipant(participant: Participant) {
    const existingParticipant = this.remoteParticipants.find(remoteParticipant => {
      return remoteParticipant.identity === participant.identity;
    });
    if (!existingParticipant) {
      this.remoteParticipants.push(participant);
    }
  }

  /**
   * @desc Searches an existing participant in the conversation's remote participants
   * and return it if it exists
   */
  getRemoteParticipant(identity: Identity): Participant {
    const existingParticipant = this.remoteParticipants.find(remoteParticipant => {
      return remoteParticipant.identity === identity;
    });
    if (existingParticipant) { return existingParticipant; }
    return null;
  }
}
