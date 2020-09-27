import * as crypto from 'crypto';
import config from '../../config/index';

const CONFIG = {
  BLOCK_CIPHER: 'aes-256-cbc',
  ENCRYPTION_KEY: config.appSecret,
  IV_BYTE_LEN: 16,
};
/**
 * @param {Buffer} data - The clear text message to be encrypted
 * @param {Buffer} key - The key to be used for encryption
 *
 */
export const encrypt = (data: string) => {
  try {
    let iv = crypto.randomBytes(CONFIG.IV_BYTE_LEN);
    let cipher = crypto.createCipheriv(CONFIG.BLOCK_CIPHER, Buffer.from(CONFIG.ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(data);

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
    let dataParts = ciphertext.split(':');
    let iv = Buffer.from(dataParts.shift(), 'hex');
    let encryptedText = Buffer.from(dataParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(CONFIG.BLOCK_CIPHER, Buffer.from(CONFIG.ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (e) {
    return new Error('Error Encrypting Token');
  }
};
