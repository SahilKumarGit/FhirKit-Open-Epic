const jwt = require('jsonwebtoken')
const fs = require('fs');
const path = require('path');
const request = require('request');
const express = require('express');

const Request = (options) => {
    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if (error) {
                return reject(error)
            }
            return resolve(body);
        });
    })
}

const app = express();
app.use(express.json())
app.all('*', async (req, res) => {
    try {
        filePath = path.join(__dirname, 'privatekey.pem');
        console.log({ filePath })

        const privateKey = fs.readFileSync(filePath);
        console.log({ privateKey })
        const now = Math.floor(Date.now() / 1000);

        const payload = {
            iss: '21f2d30c-3535-486f-9400-373047a5dab3', //Non-Production Client ID
            sub: '21f2d30c-3535-486f-9400-373047a5dab3', //Non-Production Client ID
            aud: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
            jti: 'f9eaafba-2e49-11ea-8880-' + Date.now(), //Must be no longer than 151 characters and cannot be reused during the JWT's validity period, i.e. before the exp time is reached.
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
        console.log({ jsonResponse })


        const options1 = {
            method: 'GET',
            url: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Patient/_search?gender=female&birthdate=1987-09-12&name=Camila%20Maria%20Lopez',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jsonResponse.access_token}`,
            }
        };
        const patentData = await Request(options1)
        return res.status(200).send(JSON.parse(patentData))
    } catch (error) {
        console.log(error)
        return res.status(500).send(error)
    }
})
app.listen(3200, () => console.log('server is running on port 3200'))