// Sound system disabled per user preference
class SilentAudio {
  public getMuted(): boolean { return true; }
  public setMuted(_muted: boolean) {}
  public playSuccess() {}
  public playMessage() {}
  public playDispute() {}
  public playReward() {}
  public playClick() {}
  public playError() {}
}

export const sounds = new SilentAudio();
