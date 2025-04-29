import { encode } from "blurhash";

const loadImage = async (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
};

const getImageData = (
  image: HTMLImageElement,
  width: number,
  height: number
): ImageData => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx?.drawImage(image, 0, 0, width, height);
  return ctx?.getImageData(0, 0, width, height) as ImageData;
};

export const generateBlurHash = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    
    const width = bitmap.width;
    const height = bitmap.height;
    
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    ctx.drawImage(bitmap, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, height);
    
    return encode(imageData.data, imageData.width, imageData.height, 4, 4);
  } catch (error) {
    console.error('Error generating blur hash:', error);
    return '';
  }
};
