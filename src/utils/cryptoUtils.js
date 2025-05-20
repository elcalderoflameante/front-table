import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || 'clave-secreta';

/**
 * Encripta un valor con AES
 * @param {string} value - El valor a encriptar
 * @returns {string} - El valor encriptado (base64)
 */
export const encriptar = (value) => {
    try {
        const ciphertext = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
        return ciphertext;
    } catch (err) {
        console.error('Error al encriptar:', err.message);
        return null;
    }
};

/**
 * Desencripta un valor encriptado con AES
 * @param {string} encryptedValue - El valor encriptado
 * @returns {string} - El valor desencriptado
 */
export const desencriptar = (encryptedValue) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
        console.error('Error al desencriptar:', err.message);
        return null;
    }
};