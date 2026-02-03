"use client";

import { useEffect, useRef } from "react";

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * QR Code Generator using Canvas API
 * No external dependencies - pure implementation
 */
export function QRCode({ value, size = 200, className }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Generate QR matrix
    const matrix = generateQRMatrix(value);
    const moduleSize = size / matrix.length;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Draw modules
    ctx.fillStyle = "#000000";
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x]) {
          ctx.fillRect(
            x * moduleSize,
            y * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
}

/**
 * Simplified QR code generation
 * For production, use a proper library - this is a demo implementation
 */
function generateQRMatrix(data: string): boolean[][] {
  // This is a simplified representation
  // In production, use qrcode library
  const size = 25;
  const matrix: boolean[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false));

  // Add finder patterns (corners)
  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, size - 7, 0);
  addFinderPattern(matrix, 0, size - 7);

  // Add timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Encode data as simple pattern (demo)
  const hash = simpleHash(data);
  for (let i = 0; i < 64; i++) {
    const x = 8 + (i % 8);
    const y = 8 + Math.floor(i / 8);
    if (y < size - 8 && x < size - 8) {
      matrix[y][x] = ((hash >> (i % 32)) & 1) === 1;
    }
  }

  // Add some randomness based on data
  for (let i = 0; i < data.length && i < 100; i++) {
    const code = data.charCodeAt(i);
    const x = 9 + (code % (size - 16));
    const y = 9 + ((code * 7) % (size - 16));
    if (x < size - 8 && y < size - 8) {
      matrix[y][x] = code % 2 === 0;
    }
  }

  return matrix;
}

function addFinderPattern(matrix: boolean[][], x: number, y: number): void {
  // Outer ring
  for (let i = 0; i < 7; i++) {
    matrix[y][x + i] = true;
    matrix[y + 6][x + i] = true;
    matrix[y + i][x] = true;
    matrix[y + i][x + 6] = true;
  }
  // Inner square
  for (let i = 2; i < 5; i++) {
    for (let j = 2; j < 5; j++) {
      matrix[y + i][x + j] = true;
    }
  }
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
