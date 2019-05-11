import { DataChannelEvtHandler } from './DataChannelEvtHandler';
import { Wonder } from '../wonder';
import { Identity } from './Identity';
import { Participant } from './Participant';

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
  setRtcPeerConnection() {}
  updateDemand() {}
}

class ConversationMock {
  id;
  myParticipant;
  remoteParticipants = [];
  msgEvtHandler;
  rtcEvtHandler;
  dataChannelEvtHandler;
  msgStub;
  msgSrv;
  dataChannelBroker;
  constructor(
    public wonderInstance
  ) {}
  leave() {}
  addRemoteParticipant() {}
  getRemoteParticipant(identity: Identity): Participant {
    return new ParticipantMock(null, null, null);
  }
}

describe('DataChannelEvtHandler', () => {
  const wonder = new Wonder();

  let dataChannelEvtHandler;
  const conversationMock = new ConversationMock(wonder);


  beforeEach(() => {
    dataChannelEvtHandler = new DataChannelEvtHandler(
      wonder,
      conversationMock
    );
  });

  it('should create the DataChannelEvtHandler class', () => {
    expect(dataChannelEvtHandler).toBeDefined();
    expect(dataChannelEvtHandler instanceof DataChannelEvtHandler).toBeTruthy();
    expect(dataChannelEvtHandler.dataChannel).toBe(null);
  });

});
