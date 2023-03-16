export default class Chat {
  private peer: RTCPeerConnection;
  private ices: RTCIceCandidate[] = [];
  private dataChannel: RTCDataChannel | null = null;
  private isInitiator: boolean = false;

  public onReceive?: (message: string) => void
  public onConnected?: () => void

  constructor() {
    this.peer = new RTCPeerConnection();
    this.peer.addEventListener('connectionstatechange', this.handleConnectStateChange.bind(this))
    this.peer.addEventListener('iceconnectionstatechange', this.handleIceStateChange.bind(this))
    this.peer.addEventListener('icecandidate', this.handleIceCandidate.bind(this));
    (window as any).peer = this.peer;
  }

  public async createKey() {
    return new Promise<string>(async(resolve) => {
      const offer = await this.peer.createOffer()
      await this.peer.setLocalDescription(offer)
      this.setupDataChannel(this.peer.createDataChannel('chat'))
      this.isInitiator = true
      this.peer.addEventListener('icecandidate', () => {
        if (this.peer.iceGatheringState === 'complete') {
          resolve(JSON.stringify({ offer, ices: this.ices }))
        }
      })
    })
  }

  public async receiveKey(key: string) {
    const { ices, offer } = JSON.parse(key);
    await this.peer.setRemoteDescription(offer)
    for (const ice of ices) {
      await this.peer.addIceCandidate(ice);
    }
    if (!this.isInitiator) {
      const offer = await this.peer.createAnswer()
      await this.peer.setLocalDescription(offer);
      this.peer.addEventListener('datachannel', (e: RTCDataChannelEvent) => {
        this.setupDataChannel(e.channel)
      })
      return new Promise<string>((resolve, reject) => {
        this.peer.addEventListener('icegatheringstatechange', () => {
          if (this.peer.iceGatheringState === 'complete') {
            resolve(JSON.stringify({ offer, ices: this.ices }))
          }
        })
      })
    }
  }

  public send(message: string) {
    this.dataChannel?.send(message);
  }

  private setupDataChannel(channel: RTCDataChannel) {
    this.dataChannel = channel
    this.dataChannel.addEventListener('open', () => console.log('open'))
    this.dataChannel.addEventListener('message', (e) => this.onReceive?.(e.data));
    (window as any).channel = channel
  }

  private handleConnectStateChange(e: Event) {
    if (this.peer.connectionState === 'connected') {
      this.onConnected?.()
    }
    console.log(this.peer.connectionState)
  }

  private handleIceStateChange(e: Event) {
    console.log(this.peer.iceConnectionState)
  }

  private handleIceCandidate(e: RTCPeerConnectionIceEvent) {
    if (this.peer.iceGatheringState === 'complete') {

    } else {
      if (e.candidate !== null) {
        this.ices.push(e.candidate)
      }
    }
  }
}