export interface MediaState {
  currentTime: number;
  duration: number;
  paused: boolean;
  volume: number;
  muted: boolean;
}

export interface MediaStateOwner {
  getState(): MediaState;
  setState(state: Partial<MediaState>): void;
}

export class MediaStore {
  private owners: Set<MediaStateOwner> = new Set();
  private state: MediaState = {
    currentTime: 0,
    duration: 0,
    paused: true,
    volume: 1,
    muted: false,
  };

  addOwner(owner: MediaStateOwner): void {
    this.owners.add(owner);
  }

  removeOwner(owner: MediaStateOwner): void {
    this.owners.delete(owner);
  }

  getState(): MediaState {
    return { ...this.state };
  }

  updateState(updates: Partial<MediaState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyOwners();
  }

  private notifyOwners(): void {
    this.owners.forEach(owner => {
      owner.setState(this.state);
    });
  }
}