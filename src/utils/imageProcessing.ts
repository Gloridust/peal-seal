export async function extractSeal(imageData: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法创建 canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 红色通道增强 + HSV 颜色空间处理
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // RGB to HSV conversion
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let h = 0;
        if (delta !== 0) {
          if (max === r) {
            h = ((g - b) / delta) % 6;
          } else if (max === g) {
            h = (b - r) / delta + 2;
          } else {
            h = (r - g) / delta + 4;
          }
        }
        h = h * 60;
        if (h < 0) h += 360;

        const s = max === 0 ? 0 : delta / max;
        const v = max / 255;

        // 提取红色印章
        if ((h >= 330 || h <= 30) && s > 0.3 && v > 0.2) {
          data[i] = r;     // 保持红色
          data[i + 1] = 0; // 移除绿色
          data[i + 2] = 0; // 移除蓝色
          data[i + 3] = 255; // 完全不透明
        } else {
          // 其他颜色设为透明
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = imageData;
  });
} 