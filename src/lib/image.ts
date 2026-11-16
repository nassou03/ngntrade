// Claude lit au mieux ~1568 px de côté : assez pour déchiffrer les graduations de l'axe.
const MAX_EDGE = 1568;
const START_QUALITY = 0.86;
// 4 images × ~0,95 M caractères restent sous la limite de ~4,5 Mo d'une requête Vercel.
const MAX_DATA_URL_CHARS = 950_000;

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
  const src = typeof source === "string" ? source : await blobToDataUrl(source);
  const img = await loadImage(src);
  let edge = Math.min(MAX_EDGE, Math.max(img.width, img.height));
  for (let pass = 0; pass < 5; pass++) {
    const scale = Math.min(1, edge / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponible");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // On préfère réduire la qualité JPEG un peu avant de réduire la résolution : le texte de l'axe reste net.
    for (let quality = START_QUALITY; quality >= 0.6; quality -= 0.08) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (dataUrl.length <= MAX_DATA_URL_CHARS) return dataUrl;
    }
    edge = Math.round(edge * 0.85);
  }
  throw new Error("Image trop lourde — recadrez le graphique et réessayez.");
}

export async function makeThumbnail(dataUrl: string, size = 640) {
  const img = await loadImage(dataUrl);
  const scale = size / Math.max(img.width, img.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
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
