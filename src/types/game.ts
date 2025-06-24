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
}

export interface GameObject {
  id: string;
  type: 'furniture' | 'decoration' | 'interactive';
  name: string;
  position: Position;
  width: number;
  height: number;
  color: string;
  interactive?: boolean;
}

export interface Room {
  id: string;
  name: string;
  width: number;
  height: number;
  objects: GameObject[];
  floorColor: string;
  wallColor: string;
}

export interface GameState {
  player: Player;
  room: Room;
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