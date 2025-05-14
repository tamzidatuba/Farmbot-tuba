
const farmbotApiEndpoint = "https://my.farm.bot/api/tokens"
const farmbotEmail1 = "df-labor2+1@cs.uni-kl.de"
const farmbotEmail3 = "df-labor2+3@cs.uni-kl.de"
const fakeBotPw = "84Ostertag!"

async function getApiToken() {
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
(async () => {
    try {
        const tokenData = await getApiToken();
        console.log('Token Response:', tokenData["token"]["encoded"]);
    } catch (error) {
        console.error('Fehler beim Token-Abruf:', error);
    }
})();