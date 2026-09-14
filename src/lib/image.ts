const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.72;
const MAX_DATA_URL_CHARS = 1_400_000;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Impossible de lire l’image"));
    img.src = src;
  });
}

export async function compressToDataUrl(source: Blob | string): Promise<string> {
  const src =
    typeof source === "string" ? source : await blobToDataUrl(source);
  const img = await loadImage(src);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  ctx.drawImage(img, 0, 0, width, height);
  let quality = JPEG_QUALITY;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > MAX_DATA_URL_CHARS && quality > 0.4) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrl.length > MAX_DATA_URL_CHARS) {
    throw new Error("Image trop lourde — recadrez le graphique et réessayez.");
  }
  return dataUrl;
}

export async function makeThumbnail(dataUrl: string, size = 320) {
  const img = await loadImage(dataUrl);
  const scale = size / Math.max(img.width, img.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.6);
}

export function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
    reader.readAsDataURL(blob);
  });
}

export async function fetchAsDataUrl(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Exemple indisponible");
  const blob = await res.blob();
  return compressToDataUrl(blob);
}
