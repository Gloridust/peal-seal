import { useState, useCallback } from 'react';
import Image from 'next/image';
import { extractSeal } from '@/utils/imageProcessing';
import { ParameterSlider } from '@/components/ParameterSlider';
import { ColorPicker } from '@/components/ColorPicker';
import { SEO } from '@/components/SEO';

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [params, setParams] = useState({
    targetColors: ['#FF0000'],  // 默认红色
    colorTolerance: 0.3,        // 颜色容差
    denoiseLevel: 0.5,          // 降噪强度
    sharpness: 0.5,             // 锐化强度
  });

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        setOriginalImage(dataUrl);
        setError('');
        setIsProcessing(true);
        
        try {
          const result = await extractSeal(dataUrl, params);
          setProcessedImage(result);
        } catch (error: unknown) {
          setError('处理图片时出错');
          console.error(error);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [params]);

  const handleParamChange = useCallback(async (newParams: typeof params) => {
    if (!originalImage) return;
    
    setParams(newParams);
    setIsProcessing(true);
    try {
      const result = await extractSeal(originalImage, newParams);
      setProcessedImage(result);
    } catch (error: unknown) {
      setError('处理图片时出错');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage]);

  const handleDownload = useCallback(() => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'extracted-seal.png';
      link.click();
    }
  }, [processedImage]);

  const handleColorSelect = useCallback((color: string) => {
    setSelectedColor(color);
    setParams(prev => ({
      ...prev,
      targetColors: [color, ...customColors.filter(c => c !== color)]
    }));
  }, [customColors]);

  const handleCustomColorAdd = useCallback((color: string) => {
    setCustomColors(prev => [...prev, color]);
    setParams(prev => ({
      ...prev,
      targetColors: [...prev.targetColors, color]
    }));
  }, []);

  const handleCustomColorRemove = useCallback((index: number) => {
    setCustomColors(prev => prev.filter((_, i) => i !== index));
    setParams(prev => ({
      ...prev,
      targetColors: prev.targetColors.filter((_, i) => i !== index + 1)
    }));
  }, []);

  return (
    <>
      <SEO />
      
      {/* Google AdSense */}
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6862288297154364"
        crossOrigin="anonymous"
      />

      <main className="min-h-screen bg-[var(--md-sys-color-surface)]">
        <div className="max-w-[1600px] mx-auto p-4 md:p-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--md-sys-color-primary)] to-[var(--md-sys-color-primary-container)] inline-block text-transparent bg-clip-text">
              PealSeal 印章剥离器
            </h1>
            <p className="text-[var(--md-sys-color-on-surface-variant)]">
              快速提取文档中的印章图像，支持透明背景导出
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
            {/* 左侧控制面板 */}
            <div className="space-y-6">
              {/* 颜色选择器 */}
              <ColorPicker
                selectedColor={selectedColor}
                customColors={customColors}
                onColorSelect={handleColorSelect}
                onCustomColorAdd={handleCustomColorAdd}
                onCustomColorRemove={handleCustomColorRemove}
              />

              {/* 参数调节面板 */}
              <div className="card p-4 space-y-6">
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)]"></span>
                  处理参数
                </h3>

                <ParameterSlider
                  label="颜色容差"
                  value={params.colorTolerance}
                  onChange={(value) => handleParamChange({ ...params, colorTolerance: value })}
                  min={0}
                  max={1}
                  step={0.01}
                  info="控制颜色匹配的精确度。值越高，可以匹配更多相近的颜色。如果印章颜色不均匀，可以调高此值。"
                />
                <ParameterSlider
                  label="降噪强度"
                  value={params.denoiseLevel}
                  onChange={(value) => handleParamChange({ ...params, denoiseLevel: value })}
                  min={0}
                  max={1}
                  step={0.01}
                  info="控制去除噪点的程度。值越高，可以去除更多杂点，但可能会损失一些细节。如果结果中有很多散点，可以调高此值。"
                />
                <ParameterSlider
                  label="锐化强度"
                  value={params.sharpness}
                  onChange={(value) => handleParamChange({ ...params, sharpness: value })}
                  min={0}
                  max={1}
                  step={0.01}
                  info="控制边缘的清晰度。值越高，边缘越清晰，但可能会产生锯齿。如果印章边缘模糊，可以适当调高。"
                />
              </div>
            </div>

            {/* 右侧图片区域 */}
            <div className="card p-6">
              {!originalImage ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 border-2 border-dashed border-[var(--md-sys-color-outline)]/20 rounded-lg p-8">
                  <label className="btn-primary cursor-pointer text-center">
                    选择图片上传
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    支持 JPG、PNG 格式，建议图片分辨率不超过 2000×2000
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-lg bg-[var(--md-sys-color-error)]/10 text-[var(--md-sys-color-error)] text-center">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)]"></span>
                        原始图片
                      </h3>
                      <div className="relative aspect-square bg-[var(--md-sys-color-surface-container-low)] rounded-lg overflow-hidden">
                        <Image
                          src={originalImage}
                          alt="Original"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)]"></span>
                        处理结果
                      </h3>
                      {isProcessing ? (
                        <div className="aspect-square flex items-center justify-center bg-[var(--md-sys-color-surface-container-low)] rounded-lg">
                          <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--md-sys-color-primary)] border-t-transparent"></div>
                            <p className="text-[var(--md-sys-color-on-surface-variant)]">处理中...</p>
                          </div>
                        </div>
                      ) : processedImage && (
                        <>
                          <div className="relative aspect-square bg-grid rounded-lg overflow-hidden">
                            <div className="absolute inset-0 bg-[var(--md-sys-color-surface-container-low)] bg-opacity-50"></div>
                            <Image
                              src={processedImage}
                              alt="Processed"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={handleDownload}
                              className="btn-secondary"
                            >
                              下载结果
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 添加广告位 */}
          {/* <div className="max-w-[1600px] mx-auto px-4 md:px-8 mb-8">
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-6862288297154364"
              data-ad-slot="YOUR_AD_SLOT_ID"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div> */}
        </div>
      </main>
    </>
  );
}
