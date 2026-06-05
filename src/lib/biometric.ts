// Biometric authentication via WebAuthn (Face ID, Touch ID, Windows Hello).
// Stores a device-bound platform credential; no server required for unlock.

const STORAGE_KEY = "al-malami:biometric";

type StoredCredential = {
  credentialId: string; // base64url
  userHandle: string; // base64url
  username: string;
  enrolledAt: number;
  refreshToken?: string;
};

function b64urlEncode(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function randomBytes(len: number): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(len);
  const a = new Uint8Array(buf);
  crypto.getRandomValues(a);
  return a as Uint8Array<ArrayBuffer>;
}

function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const out = new ArrayBuffer(u8.byteLength);
  new Uint8Array(out).set(u8);
  return out;
}

export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.credentials
  );
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function getStoredBiometric(): StoredCredential | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredCredential) : null;
  } catch {
    return null;
  }
}

export function clearBiometric(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function saveBiometricRefreshToken(refreshToken: string): void {
  const stored = getStoredBiometric();
  if (!stored) return;
  stored.refreshToken = refreshToken;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

export async function registerBiometric(username: string): Promise<StoredCredential> {
  if (!isWebAuthnSupported()) throw new Error("Biometric not supported on this device");

  const userHandle = randomBytes(16);
  const challenge = randomBytes(32);

  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "Al-Malami" },
      user: {
        id: userHandle,
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 }, // ES256
        { type: "public-key", alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60_000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!cred) throw new Error("Biometric setup was cancelled");

  const stored: StoredCredential = {
    credentialId: b64urlEncode(cred.rawId),
    userHandle: b64urlEncode(userHandle.buffer as ArrayBuffer),
    username,
    enrolledAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  return stored;
}

export async function authenticateBiometric(): Promise<StoredCredential> {
  if (!isWebAuthnSupported()) throw new Error("Biometric not supported on this device");
  const stored = getStoredBiometric();
  if (!stored) throw new Error("No biometric credential enrolled on this device");

  const challenge = randomBytes(32);
  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge,
      timeout: 60_000,
      userVerification: "required",
      allowCredentials: [
        {
          type: "public-key",
          id: toArrayBuffer(b64urlDecode(stored.credentialId)),
          transports: ["internal"],
        },
      ],
    },
  })) as PublicKeyCredential | null;

  if (!assertion) throw new Error("Biometric authentication failed");
  return stored;
}
