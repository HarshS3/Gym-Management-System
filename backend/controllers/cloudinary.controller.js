import cloudinary from "cloudinary";

// Configure once at import time; expects env vars CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getUploadSignature = async (req, res) => {
  try {
    const folder = req.query.folder || "members";
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign = { timestamp, folder };
    // allow arbitrary additional params (e.g., context) to be included in signature
    if (req.query.context) {
      paramsToSign.context = req.query.context;
    }
    if (req.query.public_id) {
      paramsToSign.public_id = req.query.public_id;
    }

    const signature = cloudinary.v2.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    // include back the same optional params in response so frontend can send them unchanged
    const extra = {};
    if (paramsToSign.context) extra.context = paramsToSign.context;
    if (paramsToSign.public_id) extra.public_id = paramsToSign.public_id;

    return res.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
      ...extra,
    });
  } catch (err) {
    console.error("Error generating Cloudinary signature", err);
    res.status(500).json({ message: "Failed to generate Cloudinary signature" });
  }
}; 