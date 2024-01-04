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
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));
app.use('/', express.static(path.join(__dirname, 'public')))


server.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);

});


const privacyPolicy = `
<h1 style="font-size: 24px; color: #02C7F2; font-weight: bold;">Privacy Policy for LenDaFriend </h1><br/>

Last updated: 12/21/2023<br/><br/>

This Privacy Policy describes how LenDaFriend collects, uses, and shares personal and sensitive user data. Please read this policy carefully to understand our practices regarding your information and how we will handle it.

<h3 style="font-size: 20px; font-weight: bold;">### 1. Introduction</h3>

<p style="font-size: 16px;">
    This Privacy Policy applies to the LenDaFriend mobile application and its associated services. By using our app, you agree to the terms of this Privacy Policy.
</p>


<h3 style="font-size: 20px; font-weight: bold;">### 2. Information We Collect</h3>

<h4 style="font-size: 18px; font-weight: bold;">#### a. Personal and Sensitive User Data</h4>

<p style="font-size: 16px;">
LenDaFriend may collect the following types of personal and sensitive user data:
<ul>
    <li>User profile information (e.g., name, profile picture)</li>
    <li>Contact information (e.g., email address)</li>
    <li>Location information (e.g., GPS data)</li>
    <li>User-generated content (e.g., messages, posts)</li>
</ul>
</p>

<h4 style="font-size: 18px; font-weight: bold;">#### b. How We Collect Information</h4>

<p style="font-size: 16px;">
We collect user data through the following means:
<ul>
    <li>User input during account registration and usage of the app.</li>
    <li>Access to device features such as camera, location, and contacts.</li>
    <li>Communication between users within the app.</li>
</ul>
</p>

<h3 style="font-size: 20px; font-weight: bold;">### 3. How We Use Your Information</h3>

<p style="font-size: 16px;">
We use the collected data for the following purposes:
<ul>
    <li>Providing and improving our services.</li>
    <li>Personalizing user experience.</li>
    <li>Responding to user inquiries and support requests.</li>
    <li>Analyzing app usage patterns to enhance functionality.</li>
</ul>
</p>

<h3 style="font-size: 20px; font-weight: bold;">### 4. Information Sharing</h3>

<p style="font-size: 16px;">
We may share personal and sensitive user data with the following parties:
<ul>
    <li>Other LenDaFriend users as per the app's functionality.</li>
    <li>Service providers assisting with app development, maintenance, and support.</li>
    <li>Legal authorities, if required by law or to protect our rights.</li>
</ul>
</p>


<h3 style="font-size: 20px; font-weight: bold;">### 5. Security</h3>

<p>
We implement security measures to protect personal and sensitive user data, including encryption and access controls. However, no method of transmission or storage is 100% secure.
</p>


<h3 style="font-size: 20px; font-weight: bold;">### 6. Data Retention and Deletion</h3>

<p>

We retain user data as long as necessary for the purposes outlined in this Privacy Policy. Users can request data deletion by contacting us through the provided privacy point of contact.
</p>


<h3 style="font-size: 20px; font-weight: bold;">### 7. Privacy Point of Contact</h3>

<p>
For privacy inquiries or requests, please contact us at:
<a href="mailto:kograss20@gmail.com">LenDaFriend Team</a>
</p>



<h3 style="font-size: 20px; font-weight: bold;">### 8. Changes to this Privacy Policy</h3>

<p>
We may update this Privacy Policy periodically. The latest version will be available on our app's store listing page and within the app.
</p>


<h3 style="font-size: 20px; font-weight: bold;">### 9. Availability</h3>

<p>
This Privacy Policy is accessible on an active, publicly accessible, and non-geofenced URL at <a href="https://lendafriend-d0f3d455a73a.herokuapp.com/privacy-policy">LenDaFriend privacy policy</a>.

By using LenDaFriend, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with the terms outlined herein, please do not use our app.

</p>
`;
