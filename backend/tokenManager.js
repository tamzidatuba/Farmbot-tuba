
const TOKEN_LENGTH = 30;

// Array for storing all the tokens
var tokens = new Array();

// generates a Token
// Math.random() is apparently not a good method for randomness and is therefore not quite as safe
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

// generates a token, saves it in the array and returns it
function generateAndReturnToken() {
    let token = generateToken(TOKEN_LENGTH);
    tokens.push(token);
    return token;
}

// validates that a token exists -> authenticates the token
function validateToken(token) {
    return tokens.includes(token);
}

// returns the user corresponding to the token
function getUser(token) {
    return validateToken(token) ? "admin" : "visitor";
} 

// removes the token from the token list
/*
* Known Problem: 
*   Token gets removed when admin uses logout.
*   Token wont get removed when the page is reloaded and is safed inside the array until the backend is restarted
*/
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