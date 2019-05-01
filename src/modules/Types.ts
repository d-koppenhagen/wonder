export enum MessageType {
  /** Message to invite a peer to a conversation. */
  invitation = 'invitation',
  /** Answer for conversation accepted. */
  accepted = 'accepted',
  /** Answer for conversation not accepted. */
  declined = 'declined',
  /** Message from a peer to leave a conversation */
  bye = 'bye',
  /** Message to add a new {@link Demand} */
  update = 'update',
  /** Message to process a new SDP offer or Answer
  * @TODO use update instead of invitations when being in a conversation already
  * use updatedSdp when sending the SDP answer and a conversation is already present */
  updateSdp = 'updateSdp',
  /** Answer when successfully added the new {@link Demand} */
  updated = 'updated',
  /** Message to publish the presence status of the identity */
  presence = 'presence',
  /** Message to be used when no predefined type suits the Message
  * @TODO implement it  */
  message = 'message',
  /** Message contains an ICE candidate */
  connectivityCandidate = 'connectivityCandidate'
}

export enum RtcEvtType {
  /** Event fired when the remote end adds a audio or video stream to its the peer connection */
  onaddstream = 'addstream',
  /** Event occuring when a local audio or video stream is added; this is not a standard peer connection event */
  onaddlocalstream = 'onaddlocalstream',
  /** Event fired when the SDP of the peer connection changes and a new SDP negotiation needs to be done */
  onnegotiationneeded = 'onnegotiationneeded',
  /** Event occuring each time a new ICE candidate is found and needs to be sent to the remote peer*/
  onicecandidate = 'icecandidate',
  /** Event rising when the peer connection signaling state changes */
  onsignalingstatechange = 'onsignalingstatechange',
  /** Event triggered when a stream is removed */
  onremovestream = 'onremovestream',
  /** Event emerging when the state of the ICE gathering phanse changes **/
  oniceconnectionstatechange = 'oniceconnectionstatechange',
  /** Event rising locally when a datachannel is added to the peer connection */
  ondatachannel = 'datachannel'
};

export enum DataChannelEvtType {
  /** Event seen when a data channel is opened */
  onopen = 'open',
  /** Event seen when a data channel is established */
  ondatachannel = 'ondatachannel',
  /** Event occuring when the datachannel is closed */
  onclose = 'onclose',
  /** Event rising when a message is received through a data channel */
  onmessage = 'message',
};

export enum PayloadType {
  /** Plain data codec, sends and receives data without altering it */
  plain = 'plain',
  /** Data codec for sending files */
  file = 'file',
  /** Codec for chat messages */
  chat = 'chat',
  /** Codec to send and view images */
  image = 'image',
  /** Codec to deal with voice data */
  voice = 'voice',
  /** Video codec for non RTC video transportation */
  video = 'video'
};
