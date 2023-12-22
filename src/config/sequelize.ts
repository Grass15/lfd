import dotenv from 'dotenv';
import {Sequelize} from 'sequelize';

dotenv.config();

const dbPassword = process.env.DB_PASSWORD

// const sequelize: Sequelize = new Sequelize({
//     dialect: 'mysql',
//     host: 'localhost',
//     port: 3306,
//     username: 'root',
//     password: dbPassword || "root",
//     database: 'lendafriend',
// });

const sequelize: Sequelize = new Sequelize({
    dialect: 'postgres',
    host: 'ec2-34-242-154-118.eu-west-1.compute.amazonaws.com',
    port: 5432,
    username: 'qsupdhpaoxbudh',
    password: dbPassword,
    database: 'dcr1vprt2eetq0',
});

export {sequelize};