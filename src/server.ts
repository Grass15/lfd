import express, {Express, Request, Response, Router} from 'express';
import http from 'http';
import path from "path";
import {createExpressServer} from "routing-controllers";
import {Server as SocketIOServer, Socket} from 'socket.io'
import dotenv from 'dotenv';
import * as bodyParser from "body-parser";
import {sequelize} from "./config/sequelize";
import ContactsController from "./contacts/ContactsController";
import {routes} from "./routes";
import swaggerUi from "swagger-ui-express";
import swaggerOutput from "./swagger_output.json";
import TransactionsController from "./transactions/TransactionsController";

import "reflect-metadata";
import UsersController from "./users/UsersController";
import BaseController from "./utils/BaseController";

dotenv.config();

const app: Express = createExpressServer({
    controllers: [BaseController, ContactsController, TransactionsController, UsersController], // we specify controllers we want to use
});
export const server: http.Server = http.createServer(app);
export const socketServer: SocketIOServer = new SocketIOServer(server);


const dbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};
let isTableCreated: string;
dbConnection().then(async () => {
    try {
        await sequelize.sync();
        console.log('Tables created successfully');
        isTableCreated = 'Tables created successfully';
    } catch (error) {
        console.error('Error creating tables:', error);
        isTableCreated = 'Tables not created' + JSON.stringify(error);
    }
})


const port = process.env.PORT || 8080;

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
    res.send(isTableCreated);
});

app.get('/privacy-policy', (req, res) => {
    res.send(privacyPolicy);
});
app.use('/', routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));
app.use('/public/images/', express.static(path.join(__dirname, 'public/images')));
console.log(__dirname)


server.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);

});


const privacyPolicy = `
Privacy Policy for Lend A Friend (LenDaFriend)

Last updated: 12/21/2023

This Privacy Policy describes how LenDaFriend collects, uses, and shares personal and sensitive user data. Please read this policy carefully to understand our practices regarding your information and how we will handle it.

### 1. Introduction

This Privacy Policy applies to the LenDaFriend mobile application and its associated services. By using our app, you agree to the terms of this Privacy Policy.

### 2. Information We Collect

#### a. Personal and Sensitive User Data

LenDaFriend may collect the following types of personal and sensitive user data:

- User profile information (e.g., name, profile picture)
- Contact information (e.g., email address)
- Location information (e.g., GPS data)
- User-generated content (e.g., messages, posts)

#### b. How We Collect Information

We collect user data through the following means:

- User input during account registration and usage of the app.
- Access to device features such as camera, location, and contacts.
- Communication between users within the app.

### 3. How We Use Your Information

We use the collected data for the following purposes:

- Providing and improving our services.
- Personalizing user experience.
- Responding to user inquiries and support requests.
- Analyzing app usage patterns to enhance functionality.

### 4. Information Sharing

We may share personal and sensitive user data with the following parties:

- Other LenDaFriend users as per the app's functionality.
- Service providers assisting with app development, maintenance, and support.
- Legal authorities, if required by law or to protect our rights.

### 5. Security

We implement security measures to protect personal and sensitive user data, including encryption and access controls. However, no method of transmission or storage is 100% secure.

### 6. Data Retention and Deletion

We retain user data as long as necessary for the purposes outlined in this Privacy Policy. Users can request data deletion by contacting us through the provided privacy point of contact.

### 7. Privacy Point of Contact

For privacy inquiries or requests, please contact us at:

kograss20@gmail.com

### 8. Changes to this Privacy Policy

We may update this Privacy Policy periodically. The latest version will be available on our app's store listing page and within the app.

### 9. Availability

This Privacy Policy is accessible on an active, publicly accessible, and non-geofenced URL at [Your Privacy Policy URL].

By using LenDaFriend, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with the terms outlined herein, please do not use our app.
`;
