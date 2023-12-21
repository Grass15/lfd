import {Request, Response} from "express";
import {JsonController, Body, Post, Req, Res} from "routing-controllers";
import BaseController from "../utils/BaseController";
import IUser from "./models/IUser";
import User, {LoginResponse} from "./models/User";
import UsersService from "./UsersService";

@JsonController("/api/users")
class UsersController extends BaseController {
    service: UsersService;

    constructor() {
        super();
        this.service = new UsersService();
    }

    @Post("/login")
    public async login(@Body() body: any, @Res() response: Response) {
        try {
            const {
                token,
                userData
            }: LoginResponse = await this.service.login(body.email, body.password);
            const user: User = new User(userData);
            return response.status(201).json({"status": 1, token, user});
        } catch (error) {
            return response.status(401).json({"status": 0, error: error});
        }

    }

    @Post("/register")
    public async register(@Body() body: any, @Res() response: Response) {
        try {
            console.log(body)
            const userData: IUser | null = await this.service.register(body.email, body.nickname, body.password);
            if (userData) {
                return response.status(201)
                    .json({
                        "status": 1,
                        message: 'User registered successfully',
                        user: new User(userData)
                    });
            }

        } catch (error) {
            //console.log(error)
            return response.status(409).json({"status": 0, error: error});
        }
    }

    @Post("/send-verification-code")
    public async sendVerificationCode(@Body() body: any, @Req() request: Request, @Res() response: Response) {
        try {
            console.log("data: ", body.email, " | ", body.nickname)
            await this.service.sendVerificationCode(body.email, body.nickname);
            console.log("email sent")
            return response.status(200).json({"status": 1, message: 'Email sent Successful'});
        } catch (error) {
            //console.log(error)
            return response.status(400).json({"status": 0, error: error});
        }
    }

    @Post("/update-password")
    public async updatePassword(@Body() body: any, @Res() response: Response) {
        try {
            this.service.updatePassword(body.email, body.password);
            return response.status(201).json({"status": 1, message: 'Password Updated successfully'});
        } catch (error) {
            return response.status(400).json({"status": 0, error: error});
        }
    }

    @Post("/verify-email")
    public async verifyEmail(@Body() body: any, @Res() response: Response) {
        try {
            await this.service.verifyEmail(body.code, body.email);
            return response.status(201).json({"status": 1, message: 'Email verified successfully'});
        } catch (error) {
            console.log("Just a test")
            return response.status(400).json({"status": 0, error: error});
        }
    }

    @Post("/validate-email")
    public async validateEmail(@Body() body: any, @Res() response: Response) {
        try {
            await this.service.validateEmail(body.email);
            return response.status(201).json({"status": 1, message: 'Email Does Exist'});
        } catch (error) {
            return response.status(404).json({"status": 0, error: error});
        }
    }

    @Post("/get-user")
    public async getUser(@Body() body: any, @Res() response: Response) {
        try {
            console.log(body.email)
            const user = await this.service.getUser(body.email);
            return response.status(201).json({"status": 1, message: 'Get User Success', user});
        } catch (error) {
            return response.status(404).json({"status": 0, error: error});
        } 
    }

    @Post("/verify-token")
    public async verifyToken(@Req() request: Request, @Res() response: Response) {
        try {
            const data = await this.authenticate(request);
            console.log("user from check token: ",data);
            const user = await this.service.getUser(data.email);
            console.log("user from check token2: ",user);
            return response.status(201).json({"status": 1, message: 'Authorized', user});
        } catch (error) {
            return response.status(403).json({"status": 0, error: error});
        }
    }
    

}

UsersController.updateSwagger();

export default UsersController;