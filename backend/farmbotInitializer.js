import { Farmbot } from "farmbot";

const farmbotApiEndpoint = "https://my.farm.bot/api/tokens"
const FAKE_WATER_PIN = {
    pin_type: "BoxLed3", // "Peripheral"
    pin_id: -1 //this.pinNumber
};
const FAKE_VACUUM_PIN = {
    pin_type: "BoxLed4", // "Peripheral"
    pin_id: -1 //this.pinNumber
};

const FAKE_FARMBOT_1 = {
  email: "df-labor2+1@cs.uni-kl.de",
  password: "84Ostertag!",
  vacuum_pin: FAKE_VACUUM_PIN,
  water_pin: FAKE_WATER_PIN
}

const FAKE_FARMBOT_3 = {
  email: "df-labor2+3@cs.uni-kl.de",
  password: "84Ostertag!",
  vacuum_pin: FAKE_VACUUM_PIN,
  water_pin: FAKE_WATER_PIN
}

const FARMBOT_42 = {
  email: "farmbotKL42@gmail.com",
  password: " 36Humberg!",
  vacuum_pin: {
      pin_type: "Peripheral",
      pin_id: 77683
    },
  water_pin: {
      pin_type: "Peripheral", // "Peripheral"
      pin_id: 78904 
    },
  lighting_pin: {
      pin_type: "Peripheral",
      pin_id: 78905
  }
}

const FARMBOT_DATA = FAKE_FARMBOT_3;

// Requests a API-Token and returns it
async function _getApiToken() {
    const data = {
        'user': {'email': FARMBOT_DATA.email, 'password': FARMBOT_DATA.password}
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
        try {
            await farmbot.emergencyUnlock();
        } catch(error) {
            console.log(error);
        }
        return farmbot

    } catch (error) {
        console.error('Failed to aquire Token', error);
    }
}

export {
    getFarmbot,
    FARMBOT_DATA
};