// Game types and interfaces
export interface Position {
  x: number;
  y: number;
}

export interface IsometricPosition {
  isoX: number;
  isoY: number;
  cartX: number;
  cartY: number;
}

export interface Player {
  id: string;
  name: string;
  position: Position;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  avatar: {
    color: string;
    outfit: string;
  };
  currentMessage?: string;
  messageTimestamp?: number;
}

export interface GameObject {
  id: string;
  type: 'furniture' | 'decoration' | 'interactive' | 'door';
  name: string;
  position: Position;
  width: number;
  height: number;
  color: string;
  interactive?: boolean;
  targetRoom?: string;
}

export interface Room {
  id: string;
  name: string;
  width: number;
  height: number;
  objects: GameObject[];
  floorColor: string;
  wallColor: string;
  backgroundImage?: string;
  spawnPosition?: Position;
}

export interface GameState {
  player: Player;
  currentRoomId: string;
  rooms: { [key: string]: Room };
  chatMessages: ChatMessage[];
  isGameRunning: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}