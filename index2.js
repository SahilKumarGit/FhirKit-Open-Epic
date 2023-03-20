const jwt = require('jsonwebtoken')
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const express = require('express');
let buffer;

const app = express();
app.use(express.json())
app.all('*', async (req, res) => {
    try {
        filePath = path.join(__dirname, 'privatekey.pem');
        console.log({ filePath })

        const privateKey = Buffer.from(`LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFb3dJQkFBS0NBUUVBbDkrSFFKRFV1Qk14RFBLYkphWGZydFlDOTVDdDF0SEcydHZHVzFCNVA3UFNKWG93CjNlYjd3WU0yNlkvaDQ3eGJnZitNRFVLNkE4U0tnWjY3TmdlNEgwUTRzNUhiNU85SmVkdTE5TU9OVHhHVnZlSzIKR25nU3lRS1lTeWNUOWRxRW5Ibms4d2s1ay9jOEtsYXBvOE1tUEJ2UG5IdjkwKzMvNnlMdEtNN0g1ZWdpclhHQQpMRTdCOXFlbFAzdG9pMEFoWjRRZjJLem5QYmVDdGloa2ZFS2lZVkRhR2FhV1JEYmQrSjhRb0svRUt4Q1BOT1k1Cmtzck50Q1kvRWpVdmFGdGxhSzVYYjg5cXI0c3FVYmxpcUE4cElTRzg1NGVUTXdHK29FWnJjMERwd1JieHFpWDcKSTF6WitxQWNBOWd5ZGFCR3Q5ODNvcnFxWWhQR1Vrem83MVFqd1FJREFRQUJBb0lCQUV0VjBTU2c4elBnS1R1dgorRy9qYVNLei9FTExuTC9yelVWeE1XTElkMnkzQ1c0WHY3ZkRSV3pIWnV6U3Q0MmRPSk15clVsQ3FUMEhPR0YxCjJJM0RwSHkxL1o1dG92TmNFMG1FU0MwQzk4eVovM3B5eER3N0JhNTZRQXMvZGpKRlUvUytybWcwVWtCb3FvcWgKOUlKTVltSDh0YTU4L3ZzcW13RUxrVExsNTlqTjJ3V1dHZEdBN1lIWWhtdjhMVysrcGZBRzh3aVRqUzhmcmR1dQo0WXpuZTY5MEtLek5TQ2ZwTS9iUHo3Vzk0dnd2NDF4MDdYeE8xeE9GVnlRd1NxMHBQdmc0QkFDRXNFbHE5ZXArClRJT2JZVDNQYzYycVY5SHNRRUhDSTFlQVlCbFFkTjdscXhUbkwyUXhkWEk3bGExUDFKdGp6c0tQZGlSTHUyZ3EKNk9WMStZVUNnWUVBeVFmSk1acHZwNGVya3o5NmdGaDhlVXZrYWRkNU5VRTBvaG9ROUlZS09SRVNXWG9raWViagpWdFRML1cyb2hVRlFqUFFxVFZyUG9CNWlRUXB3T2xLbVhKS0wxdVdyc1I0YmxsNDN1Ziszenk4ZUhpMWhnaS82CkF3Uld2TndEeUVqc0o1NWxUVVFsZ0pZcnRKNWtwSDE4aTFCb2tKOC8zck9RRXI2Zk85OFRuNHNDZ1lFQXdXYTIKc3VHakF0R25xS25YWFV2Y1JJck82V1Fnc2dVNnlzazFQOUU3Z0dNTzRnS2t1cCtLeXplTGJTMzkzSGhvN1BMdgo3WkE3R0NXcVZNZy9qMjhlR3k1UytpODJXNmsxTHlDV2NyVmQ2NG84UGxMWkFCcElwSmRYbUtlU3Y0S1N2QUNoCkdBRFMwV0ordlFkWEVJQjRrejNCYmdWc1NPcG5JbDRPaXZCMmMyTUNnWUVBbWFIbW80NzRCNXRLaDNTNnhQMWEKMjBRaG9yVzJmdmwvSk9jd3ovN2tMeXFaMEdIbExMS1VTUmJGY3I5c1M3Slh3ZkVUcHh4Z2ttakdCQmpiSGVkdQpGazgwcVozS01jamxvbXdNd0l2cVNGOGs4RUVVUk84dmJVRFNuUEN6djB2amxuK1p3WXZ6OFNwUzZtMG1Vd05ICnZCeE9YVUFuQ3FaRjA5MTBTY2c0OGZNQ2dZQTYrR1cyejRRVDVQZDVQeWhTNDBHcmlLT2ttSW83bmNxYWNKV1MKK3Vwb3NFdW1jR1hvSGFPRmFVOVRJQlhxOXJBUHA5ZXVtUzdib3doM3g0TlI2ZkRGR3Uva0p5Y3M5Y0FvdVlnRwpPL1VDVCtra204QmMvcWF0d1JQTmtUTDJ3QXFiMXBsSUoyQWd4aWFjM3JNV2JnWFY1NXVtUDNNUUhLRUw0cUFPCmoxbWV2d0tCZ0M4M01EZTNGNWFWSGFqdlRlQVpNaldLTklqcy9Ya3RLMkMweG5IY0hFOFRSZWVRcGZhV2NBR0gKLzFSSHBqdnFtRmpldXN4RTZJTWMzYnlTUUFlTldyUmVPVjF3REhKRlcwc2xFdkI1N05NMVNtR2tDNDc5YW9FUQpmYlFSVThjdElwVlNxNXY5TUFHZGFUZGd5bXRZNSthMEVoU2xLUlZML1Z0WFRPdWJMd25XCi0tLS0tRU5EIFJTQSBQUklWQVRFIEtFWS0tLS0tCg==`,'base64');
        console.log({ privateKey:fs.readFileSync(filePath,{encoding:'base64'})  })
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