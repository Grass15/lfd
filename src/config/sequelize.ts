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
    dialect: 'mysql',
    host: 'fdb1032.awardspace.net',
    port: 3306,
    username: '4402307_uomiou',
    password: dbPassword,
    database: '4402307_uomiou',
});

export {sequelize};