import type { IPasswordHasher } from "../../domain/user/IPasswordHasher.ts";

const encoder = new TextEncoder();
const ITERATIONS = 100_000;
const HASH_BYTES = 32;
const SALT_BYTES = 16;

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string.");
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16);
  }

  return bytes;
}

async function deriveHash(
  password: string,
  salt: ArrayBuffer,
): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    HASH_BYTES * 8,
  );

  return bytesToHex(new Uint8Array(bits));
}

export class Pbkdf2PasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const hash = await deriveHash(password, toArrayBuffer(salt));

    return `pbkdf2$${ITERATIONS}$${bytesToHex(salt)}$${hash}`;
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    const [algorithm, iterationsValue, saltHex, expectedHash] =
      storedHash.split("$");

    if (
      algorithm !== "pbkdf2" ||
      !iterationsValue ||
      !saltHex ||
      !expectedHash
    ) {
      return false;
    }

    if (Number(iterationsValue) !== ITERATIONS) {
      return false;
    }

    const derivedHash = await deriveHash(
      password,
      toArrayBuffer(hexToBytes(saltHex)),
    );
    return derivedHash === expectedHash;
  }
}
