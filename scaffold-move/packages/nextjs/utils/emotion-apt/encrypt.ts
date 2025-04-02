// 加密函数（返回格式：base64(salt) + "|" + base64(iv) + "|" + base64(ciphertext)）
export async function encryptWithEmbeddedSalt(password: string, plaintext: string): Promise<string> {
  const encoder = new TextEncoder();

  // 生成随机盐 (16字节) 和 IV (12字节)
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 从密码派生密钥
  const passwordKey = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"],
  );

  // 加密数据
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, encoder.encode(plaintext));

  // 组合为单字符串：salt|iv|ciphertext (全部base64编码)
  return [uint8ToBase64(salt), uint8ToBase64(iv), uint8ToBase64(new Uint8Array(ciphertext))].join("|");
}

// 解密函数
export async function decryptWithEmbeddedSalt(password: string, combinedCipher: string): Promise<string> {
  const encoder = new TextEncoder();

  // 拆分组件
  const [saltB64, ivB64, ciphertextB64] = combinedCipher.split("|");
  const salt = base64ToUint8(saltB64);
  const iv = base64ToUint8(ivB64);
  const ciphertext = base64ToUint8(ciphertextB64);

  // 派生密钥
  const passwordKey = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["decrypt"],
  );

  // 解密
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, ciphertext);

  return new TextDecoder().decode(decrypted);
}

// 辅助函数：Uint8Array 转 Base64
function uint8ToBase64(uint8Array: Uint8Array): string {
  return btoa(String.fromCharCode(...uint8Array));
}

// 辅助函数：Base64 转 Uint8Array
function base64ToUint8(base64: string): Uint8Array {
  return new Uint8Array(
    atob(base64)
      .split("")
      .map(c => c.charCodeAt(0)),
  );
}
