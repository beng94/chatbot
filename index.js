const bodyParser = require('body-parser');
const express = require('express');

const config = require('./config');

const app = express();

app.use(bodyParser.json());

app.get('/', (request, response) => {
    response.status(200).json('Hello world');
});

app.post('/webhook', (request, response) => {
    console.log(request.body);
});

const PORT = process.env.PORT || config.port;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
