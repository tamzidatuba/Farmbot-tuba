import { Farmbot } from "farmbot";

const farmbotApiEndpoint = "https://my.farm.bot/api/tokens"
const farmbotEmail1 = "df-labor2+1@cs.uni-kl.de"
const farmbotEmail3 = "df-labor2+3@cs.uni-kl.de"
const fakeBotPw = "84Ostertag!"

// Requests a API-Token and returns it
async function _getApiToken() {
    const data = {
        'user': {'email': farmbotEmail1, 'password': fakeBotPw}
    }
    const requestOptions = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),

    }
    try {
        const response = await fetch(farmbotApiEndpoint, requestOptions);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        return result; 
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Requests the API-Token and returns a new Farmbot-Object
async function getFarmbot() {
    try {
        const tokenData = await _getApiToken();
        console.log("Recieved Token.");

        let farmbot = new Farmbot({ token: tokenData["token"]["encoded"] });
        farmbot.connect()
        return farmbot

    } catch (error) {
        console.error('Failed to aquire Token', error);
    }
}

export {getFarmbot};