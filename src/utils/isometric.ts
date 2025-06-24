import { Position, IsometricPosition } from '../types/game';

// Isometric projection utilities
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

export function cartesianToIsometric(cartX: number, cartY: number): IsometricPosition {
  const isoX = (cartX - cartY) * (TILE_WIDTH / 2);
  const isoY = (cartX + cartY) * (TILE_HEIGHT / 2);
  
  return {
    isoX,
    isoY,
    cartX,
    cartY
  };
}

export function isometricToCartesian(isoX: number, isoY: number): Position {
  const cartX = (isoX / (TILE_WIDTH / 2) + isoY / (TILE_HEIGHT / 2)) / 2;
  const cartY = (isoY / (TILE_HEIGHT / 2) - isoX / (TILE_WIDTH / 2)) / 2;
  
  return {
    x: Math.round(cartX),
    y: Math.round(cartY)
  };
}

export function screenToIsometric(screenX: number, screenY: number, offsetX: number, offsetY: number): Position {
  const adjustedX = screenX - offsetX;
  const adjustedY = screenY - offsetY;
  
  return isometricToCartesian(adjustedX, adjustedY);
}