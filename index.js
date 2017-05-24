const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');

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
    const senderID = event.sender.id;
    const recipientID = event.recipient.id;
    const timeOfMessage = event.timestamp;
    const message = event.message;

    console.log(`Received message:\nSender: ${senderID}\nMessage: ${JSON.stringify(message)}`);

    const messageID = message.mid;
    const messageText = message.text;
    const messageAttachments = message.attachments;

    if(messageText) {
        sendResponseMessage(senderID, messageText);
    } else if (messageAttachments) {
        console.log('Attachment received');
    }
};

const sendResponseMessage = (recipientId, messageText) => {
    const messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    };

    callSendAPI(messageData);
};

const callSendAPI = (messageData) => {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: config.fb.token },
        method: 'POST',
        json: messageData
    },
    (err, response, body) => {
        if(err) {
            console.log(`Error: ${err}`);
        } else if(response.statusCode != 200) {
            console.log(`Error: ${response.statusCode}\n${JSON.stringify(body)}`);
        } else {
            const recipientID = body.recipient_id;
            const messageID = body.message_id;

            console.log(`Sent message to ${recipientID}`);
        }
    });
};

const PORT = process.env.PORT || config.port;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
