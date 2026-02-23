import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { env } from "../config/env.js";
export const aiRouter = Router();
aiRouter.use(requireAuth);
aiRouter.post("/generate-image", async (req, res, next) => {
    try {
        if (!env.FAL_KEY) {
            res.status(503).json({ message: "Image generation is not configured. Set FAL_KEY in .env." });
            return;
        }
        const { prompt, aspect_ratio = "16:9" } = req.body;
        if (!prompt || typeof prompt !== "string") {
            res.status(400).json({ message: "A prompt is required." });
            return;
        }
        const response = await fetch("https://fal.run/fal-ai/nano-banana-pro", {
            method: "POST",
            headers: {
                Authorization: `Key ${env.FAL_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt,
                aspect_ratio,
                num_images: 1,
                output_format: "png",
            }),
        });
        if (!response.ok) {
            const body = await response.text();
            res.status(response.status).json({ message: `Image generation failed: ${body}` });
            return;
        }
        const data = (await response.json());
        if (!data.images?.[0]?.url) {
            res.status(500).json({ message: "No image returned from generation service." });
            return;
        }
        res.json({ url: data.images[0].url, width: data.images[0].width, height: data.images[0].height });
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=ai.js.map