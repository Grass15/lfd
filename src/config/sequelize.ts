import dotenv from 'dotenv';
import {Sequelize} from 'sequelize';

dotenv.config();

const dbPassword = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const port: number = parseInt(process.env.DB_PORT as string);
const username = process.env.DB_USERNAME;


const sequelize: Sequelize = new Sequelize({
    dialect: 'mysql',
    host: host,
    port: port,
    username: username,
    password: dbPassword,
    database: 'lendafriend',
});


export {sequelize};