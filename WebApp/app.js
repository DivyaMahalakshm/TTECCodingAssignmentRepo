import express from 'express';
import axios from 'axios';
// const express = require('express');
// const axios = require('axios'); // Require Axios
const app = express();
const port = 8000;

const apiUrl = 'https://dqpm6c4yd6.execute-api.us-east-1.amazonaws.com/dev/getListOfVanityNumbers/+16187023530';
// export const handler=async function(event){
// Route to display the vanity numbers
app.get('/', async (req, res) => {
    try {
        const response = await axios.get(apiUrl);
        console.log('Response', response.data);

        let html = '<html><head><title>Following Last 5 Callers Vanity Numbers</title></head><body>';
        html += '<h1>Last 5 Callers Vanity Numbers</h1><ul>';

        // Iterate through the vanity numbers and create list items
        response.data.forEach(number => {
            html += `<li>${number}</li>`;
        });

        html += '</ul></body></html>';

        // Send the response
        res.send(html);
    } catch (error) {
        console.error('Error fetching vanity numbers:', error);
        res.status(500).send('Error fetching vanity numbers');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

//}
