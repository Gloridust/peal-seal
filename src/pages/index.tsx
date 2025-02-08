import { useState, useCallback } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { extractSeal } from '@/utils/imageProcessing';

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

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
          const result = await extractSeal(dataUrl);
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
  }, []);

  const handleDownload = useCallback(() => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'extracted-seal.png';
      link.click();
    }
  }, [processedImage]);

  return (
    <>
      <Head>
        <title>PealSeal 公章剥离器</title>
        <meta name="description" content="一键提取图片中的公章" />
      </Head>

      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            PealSeal 公章剥离器
          </h1>
          
          <div className="bg-[var(--md-sys-color-surface-container)] p-6 rounded-lg shadow-sm">
            <div className="mb-6">
              <label className="inline-block px-6 py-3 bg-[var(--md-sys-color-primary)] text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
                上传图片
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {error && (
              <div className="text-red-500 mb-4">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {originalImage && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">原始图片</h3>
                  <div className="relative aspect-square">
                    <Image
                      src={originalImage}
                      alt="Original"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--md-sys-color-primary)] border-t-transparent"></div>
                </div>
              ) : processedImage && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">处理结果</h3>
                  <div className="relative aspect-square bg-grid">
                    <Image
                      src={processedImage}
                      alt="Processed"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    onClick={handleDownload}
                    className="mt-4 px-6 py-2 bg-[var(--md-sys-color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    下载结果
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
