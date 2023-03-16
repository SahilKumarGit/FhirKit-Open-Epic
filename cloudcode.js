process.env.TZ = 'Asia/Kolkata';
import jwt from 'jsonwebtoken'
import axios from 'axios'
const fs = require('fs');
const path = require('path');
const request = require('request');

const Request = (/** @type {any} */ options) => {
    return new Promise((resolve, reject) => {
        request(options, function (/** @type {any} */ error, /** @type {any} */ response, /** @type {any} */ body) {
            if (error) {
                return reject(error)
            }
            return resolve(body);
        });
    })
}

/**
* @param {any} params
*/
export async function run(params) {
    try {

        if (!params.name || !params.name.trim()) return {
            error: true,
            message: 'Patient Name is required!',
            response: {}
        }

        if (!params.birthdate || !params.birthdate.trim()) return {
            error: true,
            message: 'Patient Birth Date is required (Format YYYY-MM-DD)!',
            response: {}
        }

        const filePath = path.join(__dirname, 'privatekey.pem');
        console.log({ filePath })

        const privateKey = fs.readFileSync(filePath);
        console.log({ privateKey })
        const now = Math.floor(new Date().getTime() / 1000);

        const payload = {
            iss: '21f2d30c-3535-486f-9400-373047a5dab3', //Non-Production Client ID
            sub: '21f2d30c-3535-486f-9400-373047a5dab3', //Non-Production Client ID
            aud: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
            jti: 'f9eaafba-2e49-11ea-8880-' + now, //Must be no longer than 151 characters and cannot be reused during the JWT's validity period, i.e. before the exp time is reached.
            iat: now,
            exp: now + 60, //Can be no more than 5 minutes from iat
        };

        const token = jwt.sign(payload, privateKey, { algorithm: 'RS384' });
        console.log({ token })

        const options = {
            method: 'POST',
            url: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            form: {
                grant_type: 'client_credentials',
                client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                client_assertion: token,
            },
        };

        const response = await Request(options)
        const jsonResponse = JSON.parse(response)

        const patentData = await axios.get('https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Patient/_search', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jsonResponse.access_token}`,
            },
            params: {
                // gender: "female",
                birthdate: params.birthdate,
                name: params.name
            }
        });
        console.log(patentData.data)
        return {
            error: !true,
            message: 'CloudCode Calling Successful For OpenEPIC!',
            response: patentData.data
        }
    } catch (error) {
        const message = error.error?.message || error.message || 'Unknown Error Found!'
        return {
            error: true,
            message: message,
            response: {}
        }
    }
}
