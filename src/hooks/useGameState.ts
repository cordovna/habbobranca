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
  backgroundImage: '/33d350e1-0995-4e5b-b774-7ab02e2b7e1f.png',
  spawnPosition: { x: 4, y: 4 },
  objects: [
    {
      id: 'door-1',
      type: 'door',
      name: 'Porta',
      position: { x: 9, y: 3 },
      width: 1,
      height: 1,
      color: '#8B4513',
      interactive: true,
      targetRoom: 'room-2'
    }
  ]
};

const outdoorRoom: Room = {
  id: 'room-2',
  name: 'Área Externa',
  width: 12,
  height: 10,
  floorColor: '#90EE90',
  wallColor: '#87CEEB',
  backgroundImage: '/77580a73-240b-42f6-b664-daa2b7600680.png',
  spawnPosition: { x: 1, y: 5 },
  objects: [
    {
      id: 'door-2',
      type: 'door',
      name: 'Porta de Entrada',
      position: { x: 0, y: 5 },
      width: 1,
      height: 1,
      color: '#8B4513',
      interactive: true,
      targetRoom: 'room-1'
    }
  ]
};

const initialPlayer: Player = {
  id: 'player-1',
  name: 'Player',
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
    currentRoomId: 'room-1',
    rooms: {
      'room-1': initialRoom,
      'room-2': outdoorRoom
    },
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

  // Clear player message after 5 seconds
  useEffect(() => {
    if (gameState.player.currentMessage && gameState.player.messageTimestamp) {
      const timeout = setTimeout(() => {
        setGameState(prevState => ({
          ...prevState,
          player: {
            ...prevState.player,
            currentMessage: undefined,
            messageTimestamp: undefined
          }
        }));
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [gameState.player.currentMessage, gameState.player.messageTimestamp]);

  // Smooth movement animation
  useEffect(() => {
    if (!targetPosition) return;

    const moveInterval = setInterval(() => {
      setGameState(prevState => {
        const currentPos = prevState.player.position;
        const currentRoom = prevState.rooms[prevState.currentRoomId];
        
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
        if (canMoveTo(nextPos, currentRoom, currentRoom.objects)) {
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

  const changeRoom = useCallback((roomId: string) => {
    const targetRoom = gameState.rooms[roomId];
    if (targetRoom && targetRoom.spawnPosition) {
      setGameState(prevState => ({
        ...prevState,
        currentRoomId: roomId,
        player: {
          ...prevState.player,
          position: targetRoom.spawnPosition!,
          isMoving: false
        }
      }));
      setTargetPosition(null);
    }
  }, [gameState.rooms]);

  const sendMessage = useCallback((message: string) => {
    if (message.trim()) {
      setGameState(prevState => ({
        ...prevState,
        player: {
          ...prevState.player,
          currentMessage: message.trim(),
          messageTimestamp: Date.now()
        }
      }));

      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        playerId: gameState.player.id,
        playerName: gameState.player.name,
        message: message.trim(),
        timestamp: Date.now()
      };

      setGameState(prevState => ({
        ...prevState,
        chatMessages: [...prevState.chatMessages, newMessage]
      }));
    }
  }, [gameState.player.id, gameState.player.name]);

  const getCurrentRoom = useCallback(() => {
    return gameState.rooms[gameState.currentRoomId];
  }, [gameState.rooms, gameState.currentRoomId]);

  return {
    gameState,
    onlineTime,
    movePlayerTo,
    sendMessage,
    getCurrentRoom,
    changeRoom
  };
};