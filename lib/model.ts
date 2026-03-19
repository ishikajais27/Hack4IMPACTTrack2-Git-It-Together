// ─────────────────────────────────────────────
// MODEL ENDPOINTS
// Replace the URLs and logic below when you're
// ready to plug in your actual model.
// ─────────────────────────────────────────────

export const MODEL_ENDPOINTS = {
  livestock:
    process.env.LIVESTOCK_MODEL_URL ?? 'https://your-model-endpoint/livestock',
  crop: process.env.CROP_MODEL_URL ?? 'https://your-model-endpoint/crop',
}

/**
 * Send a base64 image to the livestock model.
 * Returns a plain-text diagnosis string.
 */
export async function analyzeLivestock(imageBase64: string): Promise<string> {
  // TODO: replace with real call once endpoint is ready
  // const res = await fetch(MODEL_ENDPOINTS.livestock, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ image: imageBase64 }),
  // });
  // const data = await res.json();
  // return data.result;

  return '[Livestock model not connected yet. Plug in your endpoint in lib/model.ts]'
}

/**
 * Send a base64 image to the crop disease model.
 * Returns a plain-text diagnosis string.
 */
export async function analyzeCrop(imageBase64: string): Promise<string> {
  // TODO: replace with real call once endpoint is ready
  // const res = await fetch(MODEL_ENDPOINTS.crop, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ image: imageBase64 }),
  // });
  // const data = await res.json();
  // return data.result;

  return '[Crop model not connected yet. Plug in your endpoint in lib/model.ts]'
}
