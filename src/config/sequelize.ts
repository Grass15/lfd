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
    host: 'mysql-158687-0.cloudclusters.net',
    port: 17312,
    username: 'admin',
    password: "nhFduVEd",
    database: 'lendafriend',
});

// const sequelize: Sequelize = new Sequelize({
//     dialect: 'mysql',
//     host: 'ec2-34-242-154-118.eu-west-1.compute.amazonaws.com',
//     port: 3306,
//     username: '4402307_uomiou',
//     password: dbPassword,
//     database: '4402307_uomiou',
// });

export {sequelize};