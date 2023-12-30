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
        await sequelize.sync({force: true});
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
app.use('/', routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));
app.use('/public/images/', express.static(path.join(__dirname, 'public/images')));
console.log(__dirname)


server.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);

});