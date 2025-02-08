interface ProcessingParams {
  targetColors: string[];  // 目标颜色数组
  colorTolerance: number;  // 颜色容差
  denoiseLevel: number;    // 降噪强度
  sharpness: number;       // 锐化强度
}

export async function extractSeal(
  imageData: string, 
  params: ProcessingParams
): Promise<string> {
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
      const width = canvas.width;
      const height = canvas.height;

      // 创建临时数组存储处理结果
      const tempData = new Uint8ClampedArray(data.length);
      
      // 第一步：局部对比度增强
      const enhancedData = enhanceLocalContrast(data, width, height);
      
      // 第二步：颜色分析
      for (let i = 0; i < data.length; i += 4) {
        const r = enhancedData[i];
        const g = enhancedData[i + 1];
        const b = enhancedData[i + 2];

        const colorScore = calculateColorScore(r, g, b, params.targetColors, params.colorTolerance);

        if (colorScore > 0.5) {
          // 保持原始颜色
          tempData[i] = r;
          tempData[i + 1] = g;
          tempData[i + 2] = b;
          tempData[i + 3] = Math.min(255, colorScore * 255);
        } else {
          tempData[i + 3] = 0;
        }
      }

      // 第三步：形态学操作（填充小孔）
      morphologicalClose(tempData, width, height);

      // 第四步：中值滤波降噪
      if (params.denoiseLevel > 0) {
        const radius = Math.floor(params.denoiseLevel * 2);
        medianFilter(tempData, width, height, radius);
      }

      // 第五步：非线性锐化
      if (params.sharpness > 0) {
        unsharpMasking(tempData, width, height, params.sharpness);
      }

      // 将处理后的数据复制回 imageData
      for (let i = 0; i < data.length; i++) {
        data[i] = tempData[i];
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = imageData;
  });
}

// 局部对比度增强
function enhanceLocalContrast(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const enhanced = new Uint8ClampedArray(data.length);
  const radius = 2;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // 计算局部均值和标准差
      let sumR = 0, sumG = 0, sumB = 0;
      let count = 0;
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const nidx = (ny * width + nx) * 4;
            sumR += data[nidx];
            sumG += data[nidx + 1];
            sumB += data[nidx + 2];
            count++;
          }
        }
      }
      
      const meanR = sumR / count;
      const meanG = sumG / count;
      const meanB = sumB / count;
      
      // 应用对比度增强
      const factor = 1.5; // 对比度增强因子
      enhanced[idx] = Math.min(255, Math.max(0, meanR + (data[idx] - meanR) * factor));
      enhanced[idx + 1] = Math.min(255, Math.max(0, meanG + (data[idx + 1] - meanG) * factor));
      enhanced[idx + 2] = Math.min(255, Math.max(0, meanB + (data[idx + 2] - meanB) * factor));
      enhanced[idx + 3] = data[idx + 3];
    }
  }
  
  return enhanced;
}

// 形态学闭操作（先膨胀后腐蚀，用于填充小孔）
function morphologicalClose(data: Uint8ClampedArray, width: number, height: number) {
  const temp = new Uint8ClampedArray(data.length);
  const radius = 1;

  // 膨胀
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      let maxAlpha = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const nidx = (ny * width + nx) * 4;
            maxAlpha = Math.max(maxAlpha, data[nidx + 3]);
          }
        }
      }

      if (maxAlpha > 0) {
        temp[idx] = data[idx];
        temp[idx + 1] = 0;
        temp[idx + 2] = 0;
        temp[idx + 3] = maxAlpha;
      }
    }
  }

  // 腐蚀
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      let minAlpha = 255;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const nidx = (ny * width + nx) * 4;
            if (temp[nidx + 3] > 0) {
              minAlpha = Math.min(minAlpha, temp[nidx + 3]);
            }
          }
        }
      }

      data[idx] = temp[idx];
      data[idx + 1] = 0;
      data[idx + 2] = 0;
      data[idx + 3] = minAlpha;
    }
  }
}

// 中值滤波
function medianFilter(data: Uint8ClampedArray, width: number, height: number, radius: number) {
  const temp = new Uint8ClampedArray(data.length);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] === 0) continue; // 跳过透明像素

      const values = [];
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const nidx = (ny * width + nx) * 4;
            if (data[nidx + 3] !== 0) {
              values.push(data[nidx]);
            }
          }
        }
      }
      
      if (values.length > 0) {
        values.sort((a, b) => a - b);
        const median = values[Math.floor(values.length / 2)];
        temp[idx] = median;
        temp[idx + 3] = 255;
      }
    }
  }

  // 复制处理结果
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] !== 0) {
      data[i] = temp[i];
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = temp[i + 3];
    }
  }
}

// 非线性锐化
function unsharpMasking(data: Uint8ClampedArray, width: number, height: number, amount: number) {
  const temp = new Uint8ClampedArray(data.length);
  const radius = 1;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] === 0) continue;

      let sum = 0;
      let count = 0;
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const nidx = (ny * width + nx) * 4;
            if (data[nidx + 3] !== 0) {
              sum += data[nidx];
              count++;
            }
          }
        }
      }

      const blur = sum / count;
      const diff = data[idx] - blur;
      temp[idx] = Math.min(255, Math.max(0, data[idx] + diff * amount));
      temp[idx + 3] = 255;
    }
  }

  // 复制处理结果
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] !== 0) {
      data[i] = temp[i];
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = temp[i + 3];
    }
  }
}

// RGB 颜色距离计算
function getColorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );
}

// 十六进制颜色转 RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error('Invalid hex color');
  }
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ];
}

// 颜色判断逻辑
function calculateColorScore(
  r: number,
  g: number,
  b: number,
  targetColors: string[],
  tolerance: number
): number {
  let maxScore = 0;

  for (const targetColor of targetColors) {
    const [tr, tg, tb] = hexToRgb(targetColor);
    const distance = getColorDistance(r, g, b, tr, tg, tb);
    const maxDistance = tolerance * 442; // 442 是 RGB 空间中最大距离的一半
    const score = Math.max(0, 1 - distance / maxDistance);
    maxScore = Math.max(maxScore, score);
  }

  return maxScore;
} 