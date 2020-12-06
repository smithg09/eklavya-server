import * as crypto from 'crypto';
import { environment } from '../../../environments/environment';


const CONFIG = {
  BLOCK_CIPHER: 'aes-256-cbc',
  ENCRYPTION_KEY: environment.appSecret,
  IV_BYTE_LEN: 16,
};
/**
 * @param {Buffer} data - The clear text message to be encrypted
 * @param {Buffer} key - The key to be used for encryption
 *
 */
export const encrypt = (data: string) => {
  try {
    const iv = crypto.randomBytes(CONFIG.IV_BYTE_LEN);
    const cipher = crypto.createCipheriv(CONFIG.BLOCK_CIPHER, Buffer.from(CONFIG.ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(Buffer.from(data, 'utf8'));

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch {
    throw new Error('Error Encrypting Token');
  }
};

/**
 * @param {Buffer} ciphertext - Cipher text
 * @param {Buffer} key - The key to be used for decryption
 *
 */
export const decrypt = ciphertext => {
  try {
    const dataParts = ciphertext.split(':');
    const iv = Buffer.from(dataParts.shift(), 'hex');
    const encryptedText = Buffer.from(dataParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(CONFIG.BLOCK_CIPHER, Buffer.from(CONFIG.ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (e) {
    return new Error('Error Encrypting Token');
  }
};
