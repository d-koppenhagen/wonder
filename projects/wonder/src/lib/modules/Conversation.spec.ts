import { Conversation } from './Conversation';
import { Wonder } from '../wonder';
import { MsgEvtHandler } from './MsgEvtHandler';
import { RtcEvtHandler } from './RtcEvtHandler';

class StubMock {
  sendMessage() {}
  connect() {}
  disconnect() {}
  onMessage() {}
}

class IdentityMock {
  rtcIdentity;
  remoteIdp;
  msgStub;
  msgStubUrl;
  msgSrv;
}

class ParticipantMock {
  peerConnection;
  constructor(
    public wonderInstance,
    public identity: IdentityMock,
    public demand
  ) {}
  getRtcPeerConnection() {
    return this.peerConnection;
  }
  setRtcPeerConnection() {}
  updateDemand() {}
}

describe('Conversation', () => {
  let conversation: Conversation;
  let participantMockA: ParticipantMock;
  let participantMockB: ParticipantMock;
  const identityA = new IdentityMock();
  const identityB = new IdentityMock();
  const stubMock = new StubMock();


  beforeEach(() => {
    conversation = new Conversation(new Wonder());
    identityA.rtcIdentity = 'A';
    identityA.rtcIdentity = 'B';
    participantMockA = new ParticipantMock(null, identityA, null);
    participantMockB = new ParticipantMock(null, identityB, null);
  });

  it('should return a conversation instance', () => {
    expect(conversation instanceof Conversation).toBeTruthy();
    expect(conversation.id.length).toBe(36);
    expect(conversation.myParticipant).toBe(null);
    expect(conversation.remoteParticipants.length).toBe(0);
    expect(conversation.msgEvtHandler instanceof MsgEvtHandler).toBeTruthy();
    expect(conversation.rtcEvtHandler instanceof RtcEvtHandler).toBeTruthy();
  });

  it('should add remote participants', () => {
    conversation.addRemoteParticipant(participantMockA);
    conversation.addRemoteParticipant(participantMockA); // should no be added twice
    conversation.addRemoteParticipant(participantMockB);
    expect(conversation.remoteParticipants.length).toBe(2);
    expect(conversation.remoteParticipants).toEqual([participantMockA, participantMockB]);
  });

  it('should add get a stored participant', () => {
    conversation.remoteParticipants = [participantMockA, participantMockB];
    expect(conversation.getRemoteParticipant(identityA)).toEqual(participantMockA);
  });

  it('should close the own peer connection on leave', () => {
    conversation.myParticipant = participantMockA;
    conversation.myParticipant.peerConnection = new RTCPeerConnection();
    spyOn(conversation.myParticipant.peerConnection, 'close');
    conversation.leave();
    expect(conversation.myParticipant.peerConnection.close).toHaveBeenCalled();
  });

  it('should disconnect a messagingstub on leave', () => {
    conversation.msgStub = stubMock;
    spyOn(conversation.msgStub, 'disconnect');
    conversation.leave();
    expect(conversation.msgStub.disconnect).toHaveBeenCalled();
  });

  it('should close the remote participants peer connections on leave', () => {
    conversation.remoteParticipants = [participantMockA, participantMockB];
    conversation.remoteParticipants[0].peerConnection = new RTCPeerConnection();
    conversation.remoteParticipants[1].peerConnection = new RTCPeerConnection();
    spyOn(conversation.remoteParticipants[0].peerConnection, 'close');
    spyOn(conversation.remoteParticipants[1].peerConnection, 'close');
    conversation.leave();
    expect(conversation.remoteParticipants[0].peerConnection.close).toHaveBeenCalled();
    expect(conversation.remoteParticipants[1].peerConnection.close).toHaveBeenCalled();
  });
});
