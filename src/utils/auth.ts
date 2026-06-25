import crypto from 'crypto';

// En développement, une clé par défaut locale est tolérée.
// En production, SESSION_SECRET doit impérativement être définie dans les variables d'environnement.
// Son absence provoquerait un crash explicite plutôt qu'un fonctionnement silencieusement insécurisé.
const rawSecret = process.env.SESSION_SECRET;

if (!rawSecret && process.env.NODE_ENV === 'production') {
  throw new Error(
    "[auth] SESSION_SECRET est manquante. Définissez cette variable d'environnement avant de démarrer le serveur."
  );
}

const DEV_FALLBACK_SECRET = "dev-secret-directedemocratie-32b-local";

// Hash the secret to ensure it is always exactly 32 bytes for AES-256
const SECRET_KEY = crypto
  .createHash('sha256')
  .update(rawSecret || DEV_FALLBACK_SECRET)
  .digest();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for GCM

export interface SessionPayload {
  userId: string;
  email: string;
  pseudo: string;
  role: string;
  expiresAt: number; // Timestamp
}

/**
 * Encrypts a session payload into a secure token string
 */
export function encryptSession(payload: SessionPayload): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    
    let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:encryptedContent
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error("Erreur lors du chiffrement de la session :", error);
    throw new Error("Impossible de sécuriser la session");
  }
}

/**
 * Decrypts and validates a session token string
 * Returns the payload if valid, or null if expired/tampered
 */
export function decryptSession(token: string): SessionPayload | null {
  try {
    if (!token) return null;
    
    const parts = token.split(':');
    if (parts.length !== 3) return null;
    
    const [ivHex, authTagHex, encryptedText] = parts;
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    if (iv.length !== IV_LENGTH) return null;
    
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    const payload = JSON.parse(decrypted) as SessionPayload;
    
    // Check expiration
    if (Date.now() > payload.expiresAt) {
      return null;
    }
    
    return payload;
  } catch (error) {
    // In case of tampering, key change, or decryption failure
    console.warn("Jeton de session invalide ou altéré détecté.");
    return null;
  }
}
