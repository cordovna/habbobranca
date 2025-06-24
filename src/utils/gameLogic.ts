import { Player, GameObject, Room, Position } from '../types/game';

export function canMoveTo(position: Position, room: Room, objects: GameObject[]): boolean {
  // Check room boundaries
  if (position.x < 0 || position.x >= room.width || position.y < 0 || position.y >= room.height) {
    return false;
  }

  // Check collision with objects
  for (const obj of objects) {
    if (
      position.x >= obj.position.x &&
      position.x < obj.position.x + obj.width &&
      position.y >= obj.position.y &&
      position.y < obj.position.y + obj.height
    ) {
      return false;
    }
  }

  return true;
}

export function getNextPosition(currentPos: Position, direction: string): Position {
  const newPos = { ...currentPos };
  
  switch (direction) {
    case 'ArrowUp':
    case 'KeyW':
      newPos.y -= 1;
      break;
    case 'ArrowDown':
    case 'KeyS':
      newPos.y += 1;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      newPos.x -= 1;
      break;
    case 'ArrowRight':
    case 'KeyD':
      newPos.x += 1;
      break;
  }
  
  return newPos;
}

export function getDirectionFromKey(key: string): 'up' | 'down' | 'left' | 'right' | null {
  switch (key) {
    case 'ArrowUp':
    case 'KeyW':
      return 'up';
    case 'ArrowDown':
    case 'KeyS':
      return 'down';
    case 'ArrowLeft':
    case 'KeyA':
      return 'left';
    case 'ArrowRight':
    case 'KeyD':
      return 'right';
    default:
      return null;
  }
}