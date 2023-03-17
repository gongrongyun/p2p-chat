import { decrypt, encrypt } from "./utils";

export default class Chat {
  private peer: RTCPeerConnection;
  private ices: RTCIceCandidate[] = [];
  private dataChannel: RTCDataChannel | null = null;
  private isInitiator: boolean = false;

  public onReceive?: (message: string) => void;
  public onConnected?: () => void;
  public onError?: (e: Error | Event) => void;

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
  }

  public async createKey() {
    this.isInitiator = true;
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(offer);
    this.setupDataChannel(this.peer.createDataChannel("chat"));
    await this.gatherIceCandidate();
    return encrypt({ sdp: offer, ices: this.ices })
  }

  public async receiveKey(key: string) {
    const { ices, sdp } = decrypt(key);
    await this.peer.setRemoteDescription(sdp);
    for (const ice of ices) {
      await this.peer.addIceCandidate(ice);
    }
    if (!this.isInitiator) {
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
      this.peer.addEventListener("datachannel", (e: RTCDataChannelEvent) => {
        this.setupDataChannel(e.channel);
      });
      await this.gatherIceCandidate();
      return encrypt({ sdp: answer, ices: this.ices });
    }
  }

  public send(message: string) {
    this.dataChannel?.send(message);
  }

  public destroy() {
    this.ices = [];
    this.dataChannel?.close();
    this.peer.close();
  }

  private setupDataChannel(channel: RTCDataChannel) {
    this.dataChannel = channel;
    this.dataChannel.addEventListener("open", () => this.onConnected?.());
    this.dataChannel.addEventListener("message", (e) =>
      this.onReceive?.(e.data)
    );
    this.dataChannel.addEventListener("error", (e) => {
      this.onError?.(e);
    });
  }

  private handleConnectStateChange(e: Event) {
    console.log(this.peer.connectionState);
  }

  private handleIceStateChange(e: Event) {
    console.log(this.peer.iceConnectionState);
  }

  private handleIceCandidate(e: RTCPeerConnectionIceEvent) {
    if (e.candidate !== null) {
      this.ices.push(e.candidate);
    }
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
