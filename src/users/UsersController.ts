import {Request, Response, NextFunction} from "express";
import {JsonController, Body, Post, Req, Res} from "routing-controllers";
import ContactsService from "../contacts/ContactsService";
import TransactionsService from "../transactions/TransactionsService";
import BaseController from "../utils/BaseController";
import IUser from "./models/IUser";
import User, {LoginResponse} from "./models/User";
import UsersService from "./UsersService";

@JsonController("/api/users")
class UsersController extends BaseController {
    contactsService: ContactsService;
    service: UsersService;
    transactionsService: TransactionsService;

    constructor() {
        super();
        this.service = new UsersService();
        this.contactsService = new ContactsService();
        this.transactionsService = new TransactionsService();
    }

    @Post("/change-password")
    public async changePassword(@Req() request: Request, @Body() body: any, @Res() response: Response) {
        try {
            const data = await this.authenticate(request);
            const user = await this.service.getUser(data.email);
            await this.service.login(user.Email, body.oldPassword);
            await this.service.updatePassword(body.email, body.newPassword);
            return response.status(201).json({"status": 1, message: 'Password Updated successfully'});
        } catch (error) {
            return response.status(400).json({"status": 0, error: error});
        }
    }

    // user this route from verify token for the passkey to get the user data
    @Post("/get-user")
    public async getUser(@Req() request: Request, @Body() body: any, @Res() response: Response) {
        try {
            console.log("check passage auth:", request.headers)
            const loginMethod = body.loginMethod;
            console.log("login method: ", loginMethod);
            if (loginMethod == "passkey") {
                const user_email = await this.passageAuthMiddleware(request, response, () => Promise.resolve())
                console.log(user_email)
                body.email = user_email;
            } else if (loginMethod == "google") {
                const {userEmail, userName} = await this.googleAuthMiddleware(request);
                console.log("user email: ", userEmail, " and user name: ", userName);
                const user = await this.service.getOrCreateUser(userEmail, userName);
                await this.contactsService.setUserPendingContactsToActive(userEmail);
                await this.transactionsService.setUserPendingTransactionsToActive(userEmail, user?.UserID as number);
                return response.status(201).json({"status": 1, message: 'Get User Success', user});
            } else if (loginMethod == "facebook") {
                const {userEmail, userName} = await this.facebookAuthMiddleware(request);
                console.log("user email: ", userEmail, " and user name: ", userName);
                const user = await this.service.getOrCreateUser(userEmail, userName);
                return response.status(201).json({"status": 1, message: 'Get User Success', user});
            }

            const user = await this.service.getUser(body.email);
            console.log(user)
            return response.status(201).json({"status": 1, message: 'Get User Success', user});
        } catch (error) {
            console.log(error)
            return response.status(404).json({"status": 0, error: error});
        }
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
                await this.contactsService.setUserPendingContactsToActive(userData.Email);
                await this.transactionsService.setUserPendingTransactionsToActive(userData.Email, userData.UserID);
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

    @Post("/validate-email")
    public async validateEmail(@Body() body: any, @Res() response: Response) {
        try {
            await this.service.validateEmail(body.email);
            return response.status(201).json({"status": 1, message: 'Email Does Exist'});
        } catch (error) {
            return response.status(404).json({"status": 0, error: error});
        }
    }

    @Post("/verify-email")
    public async verifyEmail(@Body() body: any, @Res() response: Response) {
        try {
            await this.service.verifyEmail(body.code, body.email);
            return response.status(201).json({"status": 1, message: 'Email verified successfully'});
        } catch (error) {
            return response.status(400).json({"status": 0, error: "code incorrect"});
        }
    }

    @Post("/verify-token")
    public async verifyToken(@Req() request: Request, @Res() response: Response) {
        try {
            const data = await this.authenticate(request);
            const user = await this.service.getUser(data.email);
            return response.status(201).json({"status": 1, message: 'Authorized', user});
        } catch (error) {
            return response.status(403).json({"status": 0, error: error});
        }
    }

}

UsersController.updateSwagger();

export default UsersController;

function Next(): (target: UsersController, propertyKey: "getUser", parameterIndex: 3) => void {
    throw new Error("Function not implemented.");
}
