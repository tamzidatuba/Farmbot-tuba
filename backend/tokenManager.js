
const TOKEN_LENGTH = 30;

var tokens = new Array();

function generateToken(length, options = { uppercase: true, lowercase: true, numbers: true }) {
    const { uppercase = true, lowercase = true, numbers = true } = options;

    let charset = '';
    if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) charset += '0123456789';

    if (charset.length === 0) {
        throw new Error('At least one character set must be selected.');
    }

    let token = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        token += charset[randomIndex];
    }

    return token;
}

function generateAndReturnToken() {
    let token = generateToken(TOKEN_LENGTH);
    tokens.push(token);
    return token;
}

function validateToken(token) {
    return tokens.includes(token);
}

function getUser(token) {
    return validateToken(token) ? "Admin": "Visitor";
} 

function removeToken(token) {
    const index = tokens.indexOf(token);

    if (index !== -1) {
        tokens.splice(index, 1);
    }
}


export default {
    generateAndReturnToken,
    validateToken,
    getUser,
    removeToken,
}