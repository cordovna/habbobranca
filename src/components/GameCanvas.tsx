import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GameState, Player, Room } from '../types/game';
import { cartesianToIsometric, isometricToCartesian, TILE_WIDTH, TILE_HEIGHT } from '../utils/isometric';

interface GameCanvasProps {
  gameState: GameState;
  currentRoom: Room;
  width: number;
  height: number;
  onPlayerMove: (targetPosition: { x: number; y: number }) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, currentRoom, width, height, onPlayerMove }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [playerImage, setPlayerImage] = useState<HTMLImageElement | null>(null);

  // Load images
  useEffect(() => {
    const loadBackgroundImage = () => {
      if (currentRoom.backgroundImage) {
        const img = new Image();
        img.onload = () => setBackgroundImage(img);
        img.src = currentRoom.backgroundImage;
      } else {
        setBackgroundImage(null);
      }
    };

    const loadPlayerImage = () => {
      const img = new Image();
      img.onload = () => setPlayerImage(img);
      img.src = '/Flux_Dev_Isometric_female_character_sprite_in_classic_Habbo_pi_3-removebg-preview.png';
    };

    loadBackgroundImage();
    loadPlayerImage();
  }, [currentRoom.backgroundImage]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Calculate camera offset (same as in draw function)
    const roomWidth = currentRoom.width * TILE_WIDTH / 2;
    const roomHeight = currentRoom.height * TILE_HEIGHT / 2;
    const offsetX = width / 2 - roomWidth / 2;
    const offsetY = height / 4;

    // Convert screen coordinates to isometric coordinates
    const adjustedX = clickX - offsetX;
    const adjustedY = clickY - offsetY;
    
    // Convert to cartesian grid coordinates
    const cartesian = isometricToCartesian(adjustedX, adjustedY);
    
    // Ensure the target is within room bounds
    const targetX = Math.max(0, Math.min(currentRoom.width - 1, Math.round(cartesian.x)));
    const targetY = Math.max(0, Math.min(currentRoom.height - 1, Math.round(cartesian.y)));

    onPlayerMove({ x: targetX, y: targetY });
  }, [currentRoom.width, currentRoom.height, width, height, onPlayerMove]);

  const drawSpeechBubble = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, message: string) => {
    const padding = 8;
    const fontSize = 12;
    const maxWidth = 150;
    
    ctx.font = `${fontSize}px 'Courier New', monospace`;
    
    // Split text into lines
    const words = message.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Calculate bubble dimensions
    const lineHeight = fontSize + 2;
    const bubbleHeight = lines.length * lineHeight + padding * 2;
    let bubbleWidth = 0;
    
    lines.forEach(line => {
      const metrics = ctx.measureText(line);
      bubbleWidth = Math.max(bubbleWidth, metrics.width);
    });
    bubbleWidth += padding * 2;
    
    // Position bubble above player
    const bubbleX = x - bubbleWidth / 2;
    const bubbleY = y - bubbleHeight - 20;
    
    // Draw bubble background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // Rounded rectangle
    const radius = 8;
    ctx.beginPath();
    ctx.moveTo(bubbleX + radius, bubbleY);
    ctx.lineTo(bubbleX + bubbleWidth - radius, bubbleY);
    ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + radius);
    ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - radius);
    ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - radius, bubbleY + bubbleHeight);
    ctx.lineTo(bubbleX + radius, bubbleY + bubbleHeight);
    ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - radius);
    ctx.lineTo(bubbleX, bubbleY + radius);
    ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + radius, bubbleY);
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
    
    // Draw speech bubble tail
    ctx.beginPath();
    ctx.moveTo(x - 8, bubbleY + bubbleHeight);
    ctx.lineTo(x, bubbleY + bubbleHeight + 10);
    ctx.lineTo(x + 8, bubbleY + bubbleHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw text
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    
    lines.forEach((line, index) => {
      ctx.fillText(
        line,
        bubbleX + padding,
        bubbleY + padding + fontSize + (index * lineHeight)
      );
    });
  }, []);

  const drawPlayer = useCallback((ctx: CanvasRenderingContext2D, player: Player, offsetX: number, offsetY: number) => {
    const iso = cartesianToIsometric(player.position.x, player.position.y);
    const screenX = iso.isoX + offsetX;
    const screenY = iso.isoY + offsetY;

    if (playerImage) {
      // Draw player image - MUITO MAIOR
      const playerWidth = 120;  // Aumentado de 80 para 120
      const playerHeight = 150; // Aumentado de 100 para 150
      
      // Draw shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(screenX, screenY + 20, 35, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw player sprite
      ctx.drawImage(
        playerImage,
        screenX - playerWidth / 2,
        screenY - playerHeight + 20,
        playerWidth,
        playerHeight
      );

      // Draw speech bubble if player has a message
      if (player.currentMessage) {
        drawSpeechBubble(ctx, screenX, screenY - playerHeight - 10, player.currentMessage);
      }
    } else {
      // Fallback to simple circle if image not loaded
      const playerSize = 35;
      const playerHeight = 60;

      // Draw shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(screenX, screenY + 8, playerSize / 2, playerSize / 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw player body
      ctx.fillStyle = player.avatar.color;
      ctx.beginPath();
      ctx.ellipse(screenX, screenY - playerHeight / 2, playerSize / 2, playerHeight / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw player head
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(screenX, screenY - playerHeight + 15, 15, 0, Math.PI * 2);
      ctx.fill();

      // Draw speech bubble if player has a message
      if (player.currentMessage) {
        drawSpeechBubble(ctx, screenX, screenY - playerHeight - 10, player.currentMessage);
      }
    }
  }, [playerImage, drawSpeechBubble]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate camera offset to center the room
    const roomWidth = currentRoom.width * TILE_WIDTH / 2;
    const roomHeight = currentRoom.height * TILE_HEIGHT / 2;
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
      for (let x = 0; x < currentRoom.width; x++) {
        for (let y = 0; y < currentRoom.height; y++) {
          const iso = cartesianToIsometric(x, y);
          const screenX = iso.isoX + offsetX;
          const screenY = iso.isoY + offsetY;

          ctx.fillStyle = currentRoom.floorColor;
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

  }, [gameState, currentRoom, width, height, backgroundImage, drawPlayer]);

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