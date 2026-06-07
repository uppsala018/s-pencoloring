import Replicate from "replicate";

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function generateColoringImage(prompt: string): Promise<string> {
  const output = await replicate.run(
    "black-forest-labs/flux-schnell",
    {
      input: {
        prompt: `${prompt}, coloring book style, black and white line art, clean outlines, no shading, suitable for adult coloring book, highly detailed`,
        num_inference_steps: 4,
        aspect_ratio: "1:1",
        output_format: "webp",
        output_quality: 90,
      },
    }
  );

  if (Array.isArray(output) && output.length > 0) {
    return output[0] as unknown as string;
  }
  return output as unknown as string;
}
