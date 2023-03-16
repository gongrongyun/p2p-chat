export enum EventType {
  ReceiveMessage,

  // peer connection  state
  Connected,
  Connecting,
  Disconnected,

  // ice state
  ICEChecking,
  ICEConnected,
  ICECompleted,
  ICEDisconnected,

  // datachannel state
  DataChannelOpen,
}
