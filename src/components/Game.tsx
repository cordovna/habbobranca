import React from 'react';
import GameCanvas from './GameCanvas';
import ChatInput from './ChatInput';
import { useGameState } from '../hooks/useGameState';

const Game: React.FC = () => {
  const { gameState, movePlayerTo, sendMessage, getCurrentRoom } = useGameState();
  const currentRoom = getCurrentRoom();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
      {/* Título */}
      <h1 className="text-4xl font-bold text-white mb-8 tracking-wider">
        BrancaHotel
      </h1>

      {/* Room Name */}
      <div className="mb-4">
        <h2 className="text-xl text-white font-medium">
          {currentRoom.name}
        </h2>
      </div>

      {/* Game Canvas */}
      <div className="flex justify-center">
        <GameCanvas
          gameState={gameState}
          currentRoom={currentRoom}
          width={900}
          height={600}
          onPlayerMove={movePlayerTo}
        />
      </div>

      {/* Chat Input */}
      <ChatInput onSendMessage={sendMessage} />
    </div>
  );
};

export default Game;