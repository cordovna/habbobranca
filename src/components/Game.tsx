import React from 'react';
import GameCanvas from './GameCanvas';
import { useGameState } from '../hooks/useGameState';

const Game: React.FC = () => {
  const { gameState, movePlayerTo } = useGameState();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Título */}
      <h1 className="text-4xl font-bold text-white mb-8 tracking-wider">
        BrancaHotel
      </h1>

      {/* Game Canvas */}
      <div className="flex justify-center">
        <GameCanvas
          gameState={gameState}
          width={900}
          height={600}
          onPlayerMove={movePlayerTo}
        />
      </div>
    </div>
  );
};

export default Game;