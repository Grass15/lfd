import jwt from "jsonwebtoken";
import {getMetadataArgsStorage, JsonController,Body, Post, Req, Res} from 'routing-controllers';
import {routingControllersToSpec} from 'routing-controllers-openapi';
import * as fs from 'fs';
import ERRORS from "./ERRORS";
import {Request, Response, NextFunction } from "express";
import UsersService from "../users/UsersService";
import Passage from "@passageidentity/passage-node";
import { OAuth2Client } from 'google-auth-library';
import axios, { AxiosResponse } from 'axios';
@JsonController("/api")
abstract class BaseController {

    private passage : Passage;
    private passageConfig = {
        appID: process.env.PASSAGE_APP_ID as string,
        apiKey: process.env.API_KEY as string,
        authStrategy: "HEADER" as const,
      };
    
    private clientId = process.env.CLIENT_ID as string
    private google_client;
 
    constructor() {
        this.passage = new Passage(this.passageConfig);
        this.google_client = new OAuth2Client(this.clientId);
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

    public passageAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<String> => {
        try {
            console.log(req.headers)
            const userID = await this.passage.authenticateRequest(req);
            console.log(userID)
            if (userID) {
                //res.userID = userID;
                let userData = await this.passage.user.get(userID);
                console.log(userData);
                return userData.email;
            } else {
                throw new Error(ERRORS.INVALID_TOKEN);
            }
        } catch (error) {
            console.log(error)
            throw new Error("Could not authenticate user!");
        }
    };

    public googleAuthMiddleware = async (req: Request): Promise<any> => {
        try{
            const authorizationHeader = req.headers.authorization;
            
            if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
                throw new Error('Invalid or missing Authorization header');
            }
            console.log("token: ",authorizationHeader);
            const idToken = authorizationHeader.split(' ')[1];

            const ticket = await this.google_client.verifyIdToken({
                idToken,
                audience: this.clientId,
            });
        
            const payload = ticket.getPayload();
            const userEmail = payload?.email;
            const userName = payload?.name;
        
            if (!userEmail) {
                throw new Error('Invalid user ID');
            }
            console.log('User email:', userEmail);
            return {userEmail, userName};
        } catch (error) {
            console.log(error)
            throw new Error("Could not authenticate user!");
        }
    };

    public facebookAuthMiddleware = async (req: Request): Promise<any> => {
        try{
            const authorizationHeader = req.headers.authorization;
            
            if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
                throw new Error('Invalid or missing Authorization header');
            }
            console.log("token: ",authorizationHeader);
            const idToken = authorizationHeader.split(' ')[1];

            const response = await axios.get(
                `https://graph.facebook.com/debug_token`,
                {
                  params: {
                    input_token: idToken,
                    access_token: `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`,
                  },
                }
              );
        
              const data = response.data;
              console.log("data: ",data);
              if (data.data.is_valid && data.data.app_id === process.env.FACEBOOK_APP_ID) {
                const res = await axios.get(`https://graph.facebook.com/v15.0/me?fields=email,name&access_token=${idToken}`);
                // console.log("res: ",res.data);
                if (res.data && res.data.email) {
                    const userEmail = res.data.email;
                    const userName = res.data.name
                    return {userEmail,userName};
                } else {
                    throw new Error('Email not found in the response');
                }
              } else {
                // The token is not valid
                throw new Error('Invalid user Token');
              }
        } catch (error) {
            console.log(error)
            throw new Error("Could not authenticate user!");
        }
    };
 

}

BaseController.updateSwagger()

export default BaseController;






