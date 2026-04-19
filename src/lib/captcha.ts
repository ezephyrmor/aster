import { createHmac, randomBytes } from "crypto";

const CAPTCHA_SECRET =
  process.env.CAPTCHA_SECRET || "fallback-secret-change-in-production";
const CAPTCHA_EXPIRY = 5 * 60 * 1000; // 5 minutes

export interface CaptchaChallenge {
  token: string;
  image: string;
  expiresAt: number;
}

export interface CaptchaVerificationResult {
  valid: boolean;
  error?: string;
}

// Generate random CAPTCHA text
export function generateCaptchaText(length: number = 5): string {
  // Use characters that are hard to confuse (exclude 0, O, 1, I, l)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}

// Generate signed token for CAPTCHA
export function generateSignedToken(answer: string): string {
  const expiresAt = Date.now() + CAPTCHA_EXPIRY;
  const data = `${answer.toLowerCase()}:${expiresAt}`;
  const signature = createHmac("sha256", CAPTCHA_SECRET)
    .update(data)
    .digest("hex");

  return Buffer.from(`${data}:${signature}`).toString("base64");
}

// Verify CAPTCHA token and answer
export function verifyCaptchaToken(
  token: string,
  answer: string,
): CaptchaVerificationResult {
  try {
    const decoded = Buffer.from(token, "base64").toString();
    const [storedAnswer, expiresAtStr, signature] = decoded.split(":");
    const expiresAt = parseInt(expiresAtStr, 10);

    // Check expiration
    if (Date.now() > expiresAt) {
      return { valid: false, error: "CAPTCHA has expired" };
    }

    // Verify signature
    const expectedData = `${storedAnswer}:${expiresAt}`;
    const expectedSignature = createHmac("sha256", CAPTCHA_SECRET)
      .update(expectedData)
      .digest("hex");

    if (signature !== expectedSignature) {
      return { valid: false, error: "Invalid CAPTCHA token" };
    }

    // Check answer (case insensitive)
    if (answer.toLowerCase() !== storedAnswer) {
      return { valid: false, error: "Incorrect answer" };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: "Invalid CAPTCHA token format" };
  }
}

// Generate SVG CAPTCHA image
export function generateCaptchaSvg(text: string): string {
  const width = 200;
  const height = 70;

  // Generate random noise lines
  let lines = "";
  for (let i = 0; i < 8; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    const color = `rgba(${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, 0.5)`;
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" />`;
  }

  // Generate random dots
  let dots = "";
  for (let i = 0; i < 100; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const color = `rgba(${Math.random() * 150 + 50}, ${Math.random() * 150 + 50}, ${Math.random() * 150 + 50}, 0.7)`;
    dots += `<circle cx="${cx}" cy="${cy}" r="${Math.random() * 2 + 1}" fill="${color}" />`;
  }

  // Generate text characters with random rotation/position
  let textElements = "";
  const charWidth = width / text.length;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const x = i * charWidth + charWidth / 2;
    const y = height / 2 + (Math.random() * 16 - 8);
    const rotation = Math.random() * 30 - 15;
    const fontSize = 32 + Math.random() * 8;

    textElements += `<text 
      x="${x}" 
      y="${y}" 
      fill="rgb(${Math.random() * 50 + 50}, ${Math.random() * 50 + 50}, ${Math.random() * 50 + 50})"
      font-size="${fontSize}"
      font-family="monospace"
      font-weight="bold"
      text-anchor="middle"
      dominant-baseline="middle"
      transform="rotate(${rotation}, ${x}, ${y})"
    >${char}</text>`;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#f5f5f5" />
      ${lines}
      ${dots}
      ${textElements}
    </svg>
  `.trim();
}
