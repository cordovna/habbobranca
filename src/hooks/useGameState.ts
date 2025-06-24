import { useState, useEffect, useCallback } from 'react';
import { GameState, Player, Room, GameObject, ChatMessage } from '../types/game';
import { canMoveTo } from '../utils/gameLogic';

const initialRoom: Room = {
  id: 'room-1',
  name: 'Meu Quarto',
  width: 10,
  height: 8,
  floorColor: '#E5F3FF',
  wallColor: '#BFDBFE',
  objects: []
};

const initialPlayer: Player = {
  id: 'player-1',
  name: 'Você',
  position: { x: 4, y: 4 },
  direction: 'down',
  isMoving: false,
  avatar: {
    color: '#3B82F6',
    outfit: 'casual'
  }
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    player: initialPlayer,
    room: initialRoom,
    chatMessages: [],
    isGameRunning: true
  });

  const [onlineTime, setOnlineTime] = useState(0);
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);

  // Online time counter
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Smooth movement animation
  useEffect(() => {
    if (!targetPosition) return;

    const moveInterval = setInterval(() => {
      setGameState(prevState => {
        const currentPos = prevState.player.position;
        
        // Check if we've reached the target
        if (currentPos.x === targetPosition.x && currentPos.y === targetPosition.y) {
          setTargetPosition(null);
          return {
            ...prevState,
            player: {
              ...prevState.player,
              isMoving: false
            }
          };
        }

        // Calculate next step towards target
        let nextX = currentPos.x;
        let nextY = currentPos.y;
        let direction = prevState.player.direction;

        if (currentPos.x < targetPosition.x) {
          nextX = currentPos.x + 1;
          direction = 'right';
        } else if (currentPos.x > targetPosition.x) {
          nextX = currentPos.x - 1;
          direction = 'left';
        } else if (currentPos.y < targetPosition.y) {
          nextY = currentPos.y + 1;
          direction = 'down';
        } else if (currentPos.y > targetPosition.y) {
          nextY = currentPos.y - 1;
          direction = 'up';
        }

        const nextPos = { x: nextX, y: nextY };

        // Check if the next position is valid
        if (canMoveTo(nextPos, prevState.room, prevState.room.objects)) {
          return {
            ...prevState,
            player: {
              ...prevState.player,
              position: nextPos,
              direction,
              isMoving: true
            }
          };
        } else {
          // Can't move to target, stop movement
          setTargetPosition(null);
          return {
            ...prevState,
            player: {
              ...prevState.player,
              isMoving: false
            }
          };
        }
      });
    }, 300); // Move every 300ms for smooth animation

    return () => clearInterval(moveInterval);
  }, [targetPosition]);

  const movePlayerTo = useCallback((target: { x: number; y: number }) => {
    // Only set new target if not already moving to the same position
    if (!targetPosition || targetPosition.x !== target.x || targetPosition.y !== target.y) {
      setTargetPosition(target);
    }
  }, [targetPosition]);

  const addChatMessage = useCallback((message: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      playerId: gameState.player.id,
      playerName: gameState.player.name,
      message,
      timestamp: Date.now()
    };

    setGameState(prevState => ({
      ...prevState,
      chatMessages: [...prevState.chatMessages, newMessage]
    }));
  }, [gameState.player.id, gameState.player.name]);

  return {
    gameState,
    onlineTime,
    movePlayerTo,
    addChatMessage
  };
};