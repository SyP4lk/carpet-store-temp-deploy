export const calculateRugPrice = (
  basePrice: number,
  sizes: string[] | undefined,
  selectedSize: string
): number => {
  const parseArea = (sizeStr: string): number => {
    const s = sizeStr.replace(/cm/gi, "").trim();
    const m = s.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
    if (!m) return 0;
    const w = Number(m[1]);
    const h = Number(m[2]);
    return w * h;
  };

  if (!sizes || sizes.length === 0) return +basePrice.toFixed(2);

  const baseSizeArea = Math.min(...sizes.map(parseArea));
  const selectedArea = parseArea(selectedSize);

  if (baseSizeArea <= 0) return +basePrice.toFixed(2);

  const price = (selectedArea / baseSizeArea) * basePrice;

  return +price.toFixed(2);
};
