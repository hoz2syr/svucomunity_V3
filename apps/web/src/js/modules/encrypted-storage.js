/**
 * SVU Community — Encrypted localStorage wrapper
 *
 * Uses an XOR cipher keyed by a random salt stored in the same localStorage
 * namespace. Prevents casual plain-text inspection without WebCrypto overhead.
 */

const ENCRYPT_PREFIX = 'enc:';
const SALT_KEY = 'svu_enc_salt';

var salt = null;

function getSalt() {
  if (salt) return salt;
  var stored = localStorage.getItem(SALT_KEY);
  if (stored) {
    salt = stored;
    return salt;
  }
  salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), function (b) {
    return b.toString(36);
  }).join('');
  try {
    localStorage.setItem(SALT_KEY, salt);
  } catch (_) {
    // storage unavailable
  }
  return salt;
}

function xorsum(key) {
  var h = 0;
  for (var i = 0; i < key.length; i++) {
    h = ((h << 5) - h + key.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function encrypt(plain, key) {
  var ks = xorsum(key);
  var bytes = Array.from(new TextEncoder().encode(plain));
  var out = bytes.map(function (b, i) {
    return b ^ ((ks >> (i % 8)) & 0xff);
  });
  return ENCRYPT_PREFIX + btoa(String.fromCharCode.apply(null, out));
}

function decrypt(cipher, key) {
  if (!cipher.startsWith(ENCRYPT_PREFIX)) return cipher;
  var raw = atob(cipher.slice(ENCRYPT_PREFIX.length));
  var bytes = Array.from(raw, function (c) { return c.charCodeAt(0); });
  var ks = xorsum(key);
  var decoded = bytes.map(function (b, i) {
    return b ^ ((ks >> (i % 8)) & 0xff);
  });
  try {
    return new TextDecoder().decode(new Uint8Array(decoded));
  } catch (_) {
    return '';
  }
}

export function encryptedSet(key, value) {
  try {
    var cipher = encrypt(value, getSalt());
    localStorage.setItem(key, cipher);
  } catch (_) {
    // storage unavailable
  }
}

export function encryptedGet(key) {
  try {
    var raw = localStorage.getItem(key);
    if (!raw) return null;
    return raw.startsWith(ENCRYPT_PREFIX) ? decrypt(raw, getSalt()) : raw;
  } catch (_) {
    return null;
  }
}

export function encryptedRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (_) {
    // storage unavailable
  }
}
