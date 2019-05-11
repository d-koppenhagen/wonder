import { Participant } from './Participant';
import { Wonder } from '../wonder';
import { Identity } from './Identity';

describe('Participant', () => {
  let participant;

  const wonder = new Wonder();

  const identityA = new Identity(
    'alice@mydomain.com',
    'webfinger',
    null,
    'https://domain.com/stubs/mystub.js',
    'http://mymsgsrv.com'
  );

  const demandNothing = {
    in: {
      audio: false,
      video: false,
      data: false
    },
    out: {
      audio: false,
      video: false,
      data: false
    }
  };

  class ConversationMock {
    id;
    myParticipant;
    remoteParticipants = [];
    msgEvtHandler;
    rtcEvtHandler = {
      onEvt: (evt) => {}
    };
    dataChannelEvtHandler;
    msgStub;
    msgSrv;
    dataChannelBroker;
    constructor(
      public wonderInstance
    ) {}
    leave() {}
    addRemoteParticipant() {}
    getRemoteParticipant() {}
  }

  beforeEach(() => {
    participant = new Participant(
      wonder,
      identityA,
      demandNothing
    );
  });

  it('should create the participant class', () => {
    expect(participant).toBeDefined();
    expect(participant instanceof Participant).toBeTruthy();
    expect(participant.peerConnection).toBe(null);
  });

  it('should assign a peer connection', () => {
    const peerConnection = new RTCPeerConnection();
    participant.wonderInstance.conversations[0] = new ConversationMock(wonder);
    participant.setRtcPeerConnection(peerConnection);

    expect(participant.peerConnection).toBe(peerConnection);
  });

  it('should update demand parameter', () => {
    const demand = {
      in: {
        audio: false,
        video: {
          something: true
        },
        data: false
      },
      out: {
        audio: {
          something: false
        },
        video: false,
        data: true
      }
    };

    participant.updateDemand(demand);

    expect(participant.demand).toEqual(demand);
  });

});
