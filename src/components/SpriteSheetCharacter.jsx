import { useRef, useEffect, useState } from "react";
import "./SpriteSheetCharacter.css";

/**
 * SpriteSheetCharacter - Mouse-following character with sprite.webp
 *
 * Sprite layout: 8 cols x 13 rows, each cell 720x720, 97 frames total
 * Frame 0 = looking right (cx=399), Frame 48 = center (cx=356), Frame 96 = left (cx=320)
 * Canvas renders at 2x resolution for crisp edges, CSS scales down to display size.
 */
const TOTAL_FRAMES = 97;
/**
 * 自动去背景：取样画布四个角的颜色作为背景基准，
 * 通过色差判断把接近背景色的像素变为透明（带边缘羽化）
 */
function removeBackgroundAuto(ctx, width, height, threshold = 50) {
  try {
    console.log("[去背景] 函数已执行，开始取样...");
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // —— 取四个角各 4x4 区域的平均颜色作为背景色基准 ——
    let rSum = 0,
      gSum = 0,
      bSum = 0,
      cnt = 0;
    const sampleSize = 4;
    const corners = [
      [0, 0],
      [width - sampleSize, 0],
      [0, height - sampleSize],
      [width - sampleSize, height - sampleSize],
    ];
    for (const [sx, sy] of corners) {
      for (let dy = 0; dy < sampleSize; dy++) {
        for (let dx = 0; dx < sampleSize; dx++) {
          const idx = ((sy + dy) * width + (sx + dx)) * 4;
          rSum += data[idx];
          gSum += data[idx + 1];
          bSum += data[idx + 2];
          cnt++;
        }
      }
    }
    const bgR = rSum / cnt,
      bgG = gSum / cnt,
      bgB = bSum / cnt;
    console.log(
      "[去背景] 取样到的背景色基准 RGB=",
      Math.round(bgR),
      Math.round(bgG),
      Math.round(bgB),
    );

    // —— 遍历像素：与背景色差 < threshold 的就变透明（带羽化过渡） ——
    const featherRange = threshold * 0.4; // 羽化范围，防锯齿硬边
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const dR = r - bgR,
        dG = g - bgG,
        dB = b - bgB;
      const dist = Math.sqrt(dR * dR + dG * dG + dB * dB);
      if (dist < threshold) {
        let alpha;
        if (dist < threshold - featherRange) {
          alpha = 0; // 完全在背景范围内，全透明
        } else {
          // 边缘区域，按比例羽化过渡
          alpha = (dist - (threshold - featherRange)) / featherRange;
          alpha = Math.max(0, Math.min(1, alpha));
        }
        data[i + 3] = Math.round(data[i + 3] * alpha);
      }
    }
    ctx.putImageData(imageData, 0, 0);
    console.log("[去背景] 处理完成");
  } catch (e) {
    console.error("[去背景] 处理失败：", e.message || e);
  }
}
/**
 * 色彩增强：提升对比度、饱和度、亮度，让人物更鲜艳
 * contrast: 对比度增强 0~100（建议 15~35）
 * saturation: 饱和度增强 0~100（建议 10~30）
 * brightness: 亮度微调 -50~50（建议 0~10）
 */
function enhanceColors(
  ctx,
  width,
  height,
  contrast = 25,
  saturation = 20,
  brightness = 5,
) {
  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // 对比度系数换算
    const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    // 饱和度系数
    const satFactor = 1 + saturation / 100;

    for (let i = 0; i < data.length; i += 4) {
      // 只处理不透明的像素（跳过已经变透明的背景）
      if (data[i + 3] < 10) continue;

      let r = data[i],
        g = data[i + 1],
        b = data[i + 2];

      // —— 1. 亮度微调 ——
      r += brightness;
      g += brightness;
      b += brightness;

      // —— 2. 对比度增强 ——
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;

      // —— 3. 饱和度增强 ——
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
      r = gray + satFactor * (r - gray);
      g = gray + satFactor * (g - gray);
      b = gray + satFactor * (b - gray);

      // 限制在 0~255
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }
    ctx.putImageData(imageData, 0, 0);
  } catch (e) {
    console.error("[色彩增强] 失败：", e.message || e);
  }
}
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      spriteImgRef.current = img;
      setLoaded(true);
    };
    img.onerror = () => {
      console.error("Failed to load sprite.webp");
      setLoaded(false);
    };
    img.src = "/sprite.webp";

    let animId;
    const DAMPING = 0.08;

    function animate() {
      if (!spriteImgRef.current) {
        animId = requestAnimationFrame(animate);
        return;
      }

      const diff = targetRef.current - frameRef.current;
      if (Math.abs(diff) > 0.01) {
        frameRef.current += diff * DAMPING;
        frameRef.current = Math.max(
          0,
          Math.min(TOTAL_FRAMES - 1, frameRef.current),
        );
      }

      const currentFrame = frameRef.current;
      const coords = getFrameCoords(Math.round(currentFrame));

      // Canvas is 2x resolution for crisp rendering
      // 彻底清除画布，确保透明无残留
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 绘制精灵图
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(
        spriteImgRef.current,
        coords.sx,
        coords.sy,
        coords.sw,
        coords.sh,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      // 自动去除图片自带的浅色背景（阈值 50 左右：背景去掉同时不伤害人物）
      removeBackgroundAuto(ctx, canvas.width, canvas.height, 75);
      // 色彩增强：让人物颜色更鲜艳
      enhanceColors(ctx, canvas.width, canvas.height, 25, 200, -30);

      animId = requestAnimationFrame(animate);
    }
    animId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const w = rect.width;
      const ratio = Math.max(0, Math.min(1, x / w));
      // ratio=0 (mouse left) -> frame 0 (looking right), ratio=1 (mouse right) -> frame 96 (looking left)
      targetRef.current = ratio * (TOTAL_FRAMES - 1);
    }

    function onMouseLeave() {}
    function onBlur() {}

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    canvas.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <div className="sprite-character">
      <canvas
        ref={canvasRef}
        width={size * 2}
        height={size * 2}
        style={{ width: "100%", height: "100%" }}
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
