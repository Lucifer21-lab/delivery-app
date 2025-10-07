const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_SECRET || crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

exports.encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

exports.decrypt = (hash) => {
    const decipher = crypto.createDecipheriv(
        algorithm,
        secretKey,
        Buffer.from(hash.iv, 'hex')
    );

    const decrpyted = Buffer.concat([
        decipher.update(Buffer.from(hash.content, 'hex')),
        decipher.final()
    ]);

    return decrpyted.toString();
};

exports.hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

exports.compareHash = (data, hash) => {
    const dataHash = crypto.createHash('sha256').update(data).digest('hex');
    return dataHash === hash;
};

exports.generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

exports.generateOTP = (length = 6) => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};