import { Wonder } from '../wonder';
import { IDemand } from './interfaces';
import { Participant } from './Participant';
import { Conversation } from './Conversation';
import { errorHandler } from './helpfunctions';

export class CallMultiple {
  static async call(wonderInstance: Wonder, recipients: string[], conversation: Conversation, demand: IDemand) {

    console.log('[callMultiple] Multiparty call to', recipients, 'with', demand);

    if (!(recipients instanceof Array)) {
      return new Error('recipients has to be an array of Receipient');
    }

    // create remote identity and participant
    recipients.forEach(recipient => {
      wonderInstance.localIdp.getIdentity(recipient)
        .then((identity) => {
          conversation.owner = conversation.myParticipant; // set me to the owner as i started the conversation
          const participant = new Participant(wonderInstance, identity, demand);
          conversation.remoteParticipants.push(participant); // set the conversation's participants
          return conversation.id;
        }).catch((error) => {
          errorHandler(`[callMultiple] error: ${error}`);
        });
    });
  }
}
