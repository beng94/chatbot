const bodyParser = require('body-parser');
const express = require('express');

const config = require('./config');

const app = express();

app.use(bodyParser.json());

app.get('/', (request, response) => {
    response.status(200).json('Hello world');
});

app.get('/webhook', (request, response) => {
    if(request.query['hub.mode'] === 'subscribe' &&
       request.query['hub.verify_token'] === config.fb.secret) {
        console.log('Webhook validation success');
        response.status(200).send(request.query['hub.challenge']);
    } else {
        console.log('Webhook validation failed');
        response.status(403);
    }
});

app.post('/webhook', (request, response) => {
    const data = request.body;

    if(data.object === 'page') {
        data.entry.forEach((entry) => {
            const pageID = entry.id;
            const timeOfEvent = entry.time;

            entry.messaging.forEach((event) => {
                if(event.message) {
                    receivedMessage(event);
                } else {
                    console.log(`Unsupported event: ${event}`);
                }
            });
        });
    }

    response.sendStatus(200);
});

const receivedMessage = (event) => {
    console.log(event.message);
};

const PORT = process.env.PORT || config.port;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
