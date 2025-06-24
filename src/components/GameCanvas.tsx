import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GameState, Player } from '../types/game';
import { cartesianToIsometric, isometricToCartesian, TILE_WIDTH, TILE_HEIGHT } from '../utils/isometric';

interface GameCanvasProps {
  gameState: GameState;
  width: number;
  height: number;
  onPlayerMove: (targetPosition: { x: number; y: number }) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, width, height, onPlayerMove }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [playerImage, setPlayerImage] = useState<HTMLImageElement | null>(null);

  // Load images
  useEffect(() => {
    const loadBackgroundImage = () => {
      const img = new Image();
      img.onload = () => setBackgroundImage(img);
      img.src = '/33d350e1-0995-4e5b-b774-7ab02e2b7e1f.png';
    };

    const loadPlayerImage = () => {
      const img = new Image();
      img.onload = () => setPlayerImage(img);
      img.src = '/Flux_Dev_Isometric_female_character_sprite_in_classic_Habbo_pi_3-removebg-preview.png';
    };

    loadBackgroundImage();
    loadPlayerImage();
  }, []);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Calculate camera offset (same as in draw function)
    const roomWidth = gameState.room.width * TILE_WIDTH / 2;
    const roomHeight = gameState.room.height * TILE_HEIGHT / 2;
    const offsetX = width / 2 - roomWidth / 2;
    const offsetY = height / 4;

    // Convert screen coordinates to isometric coordinates
    const adjustedX = clickX - offsetX;
    const adjustedY = clickY - offsetY;
    
    // Convert to cartesian grid coordinates
    const cartesian = isometricToCartesian(adjustedX, adjustedY);
    
    // Ensure the target is within room bounds
    const targetX = Math.max(0, Math.min(gameState.room.width - 1, Math.round(cartesian.x)));
    const targetY = Math.max(0, Math.min(gameState.room.height - 1, Math.round(cartesian.y)));

    onPlayerMove({ x: targetX, y: targetY });
  }, [gameState.room.width, gameState.room.height, width, height, onPlayerMove]);

  const drawPlayer = useCallback((ctx: CanvasRenderingContext2D, player: Player, offsetX: number, offsetY: number) => {
    const iso = cartesianToIsometric(player.position.x, player.position.y);
    const screenX = iso.isoX + offsetX;
    const screenY = iso.isoY + offsetY;

    if (playerImage) {
      // Draw player image - AUMENTADO
      const playerWidth = 80;  // Aumentado de 60 para 80
      const playerHeight = 100; // Aumentado de 80 para 100
      
      // Draw shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(screenX, screenY + 15, 25, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw player sprite
      ctx.drawImage(
        playerImage,
        screenX - playerWidth / 2,
        screenY - playerHeight + 15,
        playerWidth,
        playerHeight
      );

      // Draw player name with better styling
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(player.name, screenX, screenY - playerHeight - 10);
      ctx.fillText(player.name, screenX, screenY - playerHeight - 10);
    } else {
      // Fallback to simple circle if image not loaded
      const playerSize = 25;
      const playerHeight = 40;

      // Draw shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(screenX, screenY + 5, playerSize / 2, playerSize / 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw player body
      ctx.fillStyle = player.avatar.color;
      ctx.beginPath();
      ctx.ellipse(screenX, screenY - playerHeight / 2, playerSize / 2, playerHeight / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw player head
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(screenX, screenY - playerHeight + 10, 10, 0, Math.PI * 2);
      ctx.fill();

      // Draw player name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(player.name, screenX, screenY - playerHeight - 10);
      ctx.fillText(player.name, screenX, screenY - playerHeight - 10);
    }
  }, [playerImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate camera offset to center the room
    const roomWidth = gameState.room.width * TILE_WIDTH / 2;
    const roomHeight = gameState.room.height * TILE_HEIGHT / 2;
    const offsetX = width / 2 - roomWidth / 2;
    const offsetY = height / 4;

    if (backgroundImage) {
      // Draw the background image scaled to fit the canvas
      const scale = Math.min(width / backgroundImage.width, height / backgroundImage.height) * 1.3;
      const imgWidth = backgroundImage.width * scale;
      const imgHeight = backgroundImage.height * scale;
      const imgX = (width - imgWidth) / 2;
      const imgY = (height - imgHeight) / 2;
      
      ctx.drawImage(backgroundImage, imgX, imgY, imgWidth, imgHeight);
    } else {
      // Fallback: draw simple floor tiles
      for (let x = 0; x < gameState.room.width; x++) {
        for (let y = 0; y < gameState.room.height; y++) {
          const iso = cartesianToIsometric(x, y);
          const screenX = iso.isoX + offsetX;
          const screenY = iso.isoY + offsetY;

          ctx.fillStyle = gameState.room.floorColor;
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(screenX + TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2);
          ctx.lineTo(screenX, screenY + TILE_HEIGHT);
          ctx.lineTo(screenX - TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2);
          ctx.closePath();
          ctx.fill();

          // Add border
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Draw player
    drawPlayer(ctx, gameState.player, offsetX, offsetY);

  }, [gameState, width, height, backgroundImage, drawPlayer]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border-2 border-gray-600 rounded-lg shadow-2xl cursor-pointer"
      onClick={handleCanvasClick}
    />
  );
};

export default GameCanvas;