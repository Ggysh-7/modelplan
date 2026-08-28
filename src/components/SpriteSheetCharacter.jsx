import { useRef, useEffect, useState } from 'react';
import './SpriteSheetCharacter.css';

/**
 * SpriteSheetCharacter - Mouse-following character with sprite.webp
 *
 * Sprite layout: 8 cols x 13 rows, each cell 720x720, 97 frames total
 * Frame 0 = looking right (cx=399), Frame 48 = center (cx=356), Frame 96 = left (cx=320)
 */
const TOTAL_FRAMES = 97;
const SPRITE_COLS = 8;
const SPRITE_ROW_HEIGHT = 720;
const SPRITE_CELL_WIDTH = 720;

function getFrameCoords(frameIndex) {
  const col = frameIndex % SPRITE_COLS;
  const row = Math.floor(frameIndex / SPRITE_COLS);
  return {
    sx: col * SPRITE_CELL_WIDTH,
    sy: row * SPRITE_ROW_HEIGHT,
    sw: SPRITE_CELL_WIDTH,
    sh: SPRITE_ROW_HEIGHT,
  };
}

export default function SpriteSheetCharacter({ size = 360 }) {
  const canvasRef = useRef(null);
  const spriteImgRef = useRef(null);
  const frameRef = useRef(0);
  const targetRef = useRef(0);
  const charWRef = useRef(size);
  const charHRef = useRef(size * 1.2); // 720/720 = 1:1 but we use 1.2 for better visual
  const isOnPageRef = useRef(false);
  const lastMouseXRef = useRef(0.5);
  const [loaded, setLoaded] = useState(false);

  // Keep refs in sync
  useEffect(() => {
    charWRef.current = size;
    charHRef.current = size * (720 / 720); // character aspect ratio from sprite
  }, [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load sprite
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      spriteImgRef.current = img;
      setLoaded(true);
    };
    img.onerror = () => {
      console.error('Failed to load sprite.webp');
      setLoaded(false);
    };
    img.src = '/sprite.webp';

    // Animation loop
    let animId;
    const DAMPING = 0.08; // Lower = smoother/slower, Higher = snappier
    // Cap per-frame movement to prevent jumps

    function animate() {
      if (!spriteImgRef.current) { animId = requestAnimationFrame(animate); return; }

      // Smooth interpolation toward target
      const diff = targetRef.current - frameRef.current;
      if (Math.abs(diff) > 0.01) {
        frameRef.current += diff * DAMPING;
        // Clamp to prevent overshoot
        frameRef.current = Math.max(0, Math.min(TOTAL_FRAMES - 1, frameRef.current));
      }

      const currentFrame = frameRef.current;
      const coords = getFrameCoords(Math.round(currentFrame));

      const cw = charWRef.current;
      const ch = charHRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw character from sprite with proper alpha compositing
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(
        spriteImgRef.current,
        coords.sx, coords.sy, coords.sw, coords.sh,
        0, 0, cw, ch
      );
      ctx.globalCompositeOperation = 'source-over';

      animId = requestAnimationFrame(animate);
    }
    animId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animId);
  }, []);

  // Mouse move handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function onMouseMove(e) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const w = rect.width;

      // Normalize: 0 (left) to 1 (right)
      const ratio = Math.max(0, Math.min(1, x / w));
      lastMouseXRef.current = ratio;
      isOnPageRef.current = true;

      // Map ratio to frame index: ratio 0 -> frame 0 (right), ratio 1 -> frame 96 (left)
      // Because frame 0 has cx=399 (looking right), frame 96 has cx=320 (looking left)
      // So ratio=0 (mouse left) -> look left -> frame 96
      //    ratio=1 (mouse right) -> look right -> frame 0
      targetRef.current = ratio * (TOTAL_FRAMES - 1);
    }

    function onMouseLeave() {
      isOnPageRef.current = false;
    }

    function onBlur() {
      isOnPageRef.current = false;
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    canvasRef.current?.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      canvas?.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  return (
    <div className="sprite-character" style={{ width: size, height: size * (720/720) }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="sprite-canvas"
      />
      {!loaded && (
        <div className="sprite-loading">
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  );
}



