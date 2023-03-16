const jwt = require('jsonwebtoken')
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const express = require('express');

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
            exp: now + 300, //Can be no more than 5 minutes from iat
        };

        const token = jwt.sign(payload, privateKey, { algorithm: 'RS384' });
        console.log({ token })

        const response = await axios.post('https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token', {
            grant_type: 'client_credentials',
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            client_assertion: token,
        }, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        console.log({ Response: response.data })

        const patentData = await axios.get('https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Patient/_search', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${response.data?.access_token}`,
            },
            params: {
                // gender: "female",
                birthdate: "1987-09-12",
                name: "Camila Maria Lopez"
            }
        });
        return res.status(200).send(patentData.data)
    } catch (error) {
        console.log(error)
        return res.status(500).send(error)
    }
})
app.listen(3200, () => console.log('server is running on port 3200'))