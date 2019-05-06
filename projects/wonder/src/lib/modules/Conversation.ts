import { Wonder } from '../wonder';
import { guid } from './helpfunctions';
import { Identity } from './Identity';
import { Participant } from './Participant';
import { MsgEvtHandler } from './MsgEvtHandler';
import { RtcEvtHandler } from './RtcEvtHandler';
import { DataChannelEvtHandler } from './DataChannelEvtHandler';
import { IMessagingStub } from './interfaces';
import { DataChannelBroker } from './DataChannelBroker';

export class Conversation {
  id: string = guid();
  myParticipant: Participant = null;
  remoteParticipants: Participant[] = [];
  msgEvtHandler: MsgEvtHandler;
  rtcEvtHandler: RtcEvtHandler;
  dataChannelEvtHandler: DataChannelEvtHandler = null;
  msgStub: IMessagingStub = null;
  msgSrv: string = null;
  dataChannelBroker: DataChannelBroker = null;


  constructor(
    public wonderInstance: Wonder,
    public owner?: Participant
  ) {
    this.msgEvtHandler = new MsgEvtHandler(this.wonderInstance, this);
    this.rtcEvtHandler = new RtcEvtHandler(this.wonderInstance, this);
  }

  leave() {
    this.myParticipant.peerConnection.close();
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

  addRemoteParticipant(participant: Participant) {
    const existingParticipant = this.remoteParticipants.find(remoteParticipant => {
      return remoteParticipant.identity === participant.identity;
    });
    if (!existingParticipant) {
      this.remoteParticipants.push(participant);
    }
  }

  getRemoteParticipant(identity: Identity): Participant {
    const existingParticipant = this.remoteParticipants.find(remoteParticipant => {
        return remoteParticipant.identity === identity;
    });
    if (existingParticipant) { return existingParticipant; }
    return null;
  }
}
