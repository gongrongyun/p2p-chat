import { decrypt, encrypt } from "./utils";
export default class Chat {
  private peer: RTCPeerConnection;
  private ices: Array<RTCIceCandidate | null> = [];
  private dataChannel: RTCDataChannel | null = null;
  private isInitiator: boolean = false;
  private senders: RTCRtpSender[] = []

  public onReceive?: (message: string) => void;
  public onConnected?: () => void;
  public onError?: (e: Error | Event) => void;
  public onOpen?: () => void;
  public onTrack?: (stream: MediaStream) => void;

  constructor() {
    this.peer = new RTCPeerConnection();
    this.peer.addEventListener(
      "connectionstatechange",
      this.handleConnectStateChange.bind(this)
    );
    this.peer.addEventListener(
      "iceconnectionstatechange",
      this.handleIceStateChange.bind(this)
    );
    this.peer.addEventListener(
      "icecandidate",
      this.handleIceCandidate.bind(this)
    );
    this.peer.addEventListener("icecandidateerror", (e) => {
      this.onError?.(e);
    });
    this.peer.addEventListener('track', (e: RTCTrackEvent) => {
      console.log('get remote track')
      this.onTrack?.(e.streams[0])
    })
  }

  public async createKey() {
    this.isInitiator = true;
    this.setupDataChannel(this.peer.createDataChannel("chat"));
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(offer)
    await this.gatherIceCandidate();
    return encrypt({ sdp: offer, ices: this.ices })
  }

  public async receiveKey(key: string) {
    const { ices, sdp } = decrypt(key);
    await this.peer.setRemoteDescription(sdp);
    for (const ice of ices) {
      await this.peer.addIceCandidate({...ice, type: 'candidate'});
    }
    if (!this.isInitiator) {
      this.peer.addEventListener("datachannel", (e: RTCDataChannelEvent) => {
        this.setupDataChannel(e.channel);
      });
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
      await this.gatherIceCandidate();
      return encrypt({ sdp: answer, ices: this.ices });
    }
  }

  public send(message: string) {
    this.dataChannel?.send(message);
  }

  public publish(track: MediaStreamTrack, stream: MediaStream) {
    this.senders.push(this.peer.addTrack(track, stream))
  }

  public removeTracks() {
    this.senders.forEach(sender => {
      sender.track?.stop()
      this.peer.removeTrack(sender)
    })
    this.senders = []
  }

  public destroy() {
    this.ices = [];
    this.dataChannel?.close();
    this.peer.close();
  }

  private setupDataChannel(channel: RTCDataChannel) {
    this.dataChannel = channel;
    this.dataChannel.addEventListener("open", () => this.onOpen?.());
    this.dataChannel.addEventListener("message", (e) =>
      this.onReceive?.(e.data)
    );
    this.dataChannel.addEventListener("error", (e) => {
      this.onError?.(e);
    });
  }

  private handleConnectStateChange(e: Event) {
    console.log(this.peer.connectionState);
    if (this.peer.connectionState === 'connected') {
      this.onConnected?.()
    }
  }

  private handleIceStateChange(e: Event) {
    console.log(this.peer.iceConnectionState);
  }

  private handleIceCandidate(e: RTCPeerConnectionIceEvent) {
    // if (e.candidate !== null) {
      this.ices.push(e.candidate);
    // }
  }

  private async gatherIceCandidate() {
    return new Promise<void>((resolve) => {
      if (this.peer.iceGatheringState === "complete") {
        resolve();
      } else {
        this.peer.addEventListener("icegatheringstatechange", () => {
          console.log(this.peer.iceGatheringState)
          // Safari doesn't have 'complete' state
          if (this.peer.iceGatheringState === "complete") {
            resolve();
          }
        });
      }
    });
  }
}
