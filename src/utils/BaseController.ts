import jwt from "jsonwebtoken";
import {getMetadataArgsStorage, JsonController,Body, Post, Req, Res} from 'routing-controllers';
import {routingControllersToSpec} from 'routing-controllers-openapi';
import * as fs from 'fs';
import ERRORS from "./ERRORS";
import {Request, Response} from "express";
import UsersService from "../users/UsersService";

@JsonController("/api")
abstract class BaseController {

    private usersService: UsersService;

    constructor() {
        this.usersService = new UsersService();
    }
    public static updateSwagger() {
        const storage = getMetadataArgsStorage();
        const spec = routingControllersToSpec(storage);
        const swaggerOutput = JSON.parse(fs.readFileSync('src/swagger_output.json', 'utf8'));
        Object.assign(swaggerOutput.paths, spec.paths);
        fs.writeFileSync('src/swagger_output.json', JSON.stringify(swaggerOutput, null, 2), 'utf8');
    }


    public async authenticate(request: Request): Promise<any> {
        try {
            const token = request.header('Authorization');
            if (!token) {
                throw new Error(ERRORS.INVALID_TOKEN);
            }
    
            return new Promise((resolve, reject) => {
                jwt.verify(token as string, process.env.SECRET_KEY as string, (error, user) => {
                    if (error) {
                        reject(new Error(ERRORS.INVALID_TOKEN));
                    } else {
                        resolve(user);
                    }
                });
            });
        } catch (error) {
            throw new Error(ERRORS.INVALID_TOKEN);
        }
    }

    

}

BaseController.updateSwagger()

export default BaseController;






