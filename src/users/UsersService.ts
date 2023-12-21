import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import ERRORS from "../utils/ERRORS";
import IUser from "./models/IUser";
import {AccountStatus, LoginResponse} from "./models/User";
import UserAdapter from "./models/UserAdapter";
import EmailsService from "../emails/EmailsService";
dotenv.config();

class UsersService {

    emailsService: EmailsService;

    verificationCodes: [email: string, code: number][] = [];

    constructor() {
        this.emailsService = new EmailsService();
    }

    public async getByEmail(email: string): Promise<IUser | null> {
        return await UserAdapter.findOne({
            where: {
                Email: email,
            },
        });
    }

    public async getById(userId: number): Promise<IUser | null> {
        return await UserAdapter.findOne({
            where: {
                UserID: userId,
            },
        })
    }

    public async login(email: string, password: string) {
        const user: IUser | null = await this.getByEmail(email);
        if (user) {
            const isRightPassword: boolean = await bcrypt.compare(password, user.Password_Hash);
            if (isRightPassword) {
                if (user.Account_Status == AccountStatus.UNVERIFIED) {
                    throw new Error(ERRORS.UNVERIFIED_ACCOUNT);
                } else if (user.Account_Status == AccountStatus.SUSPENDED) {
                    throw new Error(ERRORS.SUSPENDED_ACCOUNT);
                } else {
                    const loginResponse: LoginResponse = {
                        token: this.getToken(user),
                        userData: user
                    }
                    return loginResponse;
                }
            } else {
                throw new Error(ERRORS.INVALID_CREDENTIALS);
            }
        } else {
            throw new Error(ERRORS.USER_DOES_NOT_EXIST);
        }

    }

    public async register(email: string, nickname: string, password: string) {

        if (await this.doesUserExist(email)) {
            throw new Error(ERRORS.USER_ALREADY_EXISTS);
        } else {
            return await this.createUser(email, nickname, password);
        }
    }

    public async sendVerificationCode(email: string, nickname: string) {
        if (!(await this.doesUserExist(email))) {
            throw new Error(ERRORS.USER_DOES_NOT_EXIST);
        } else {
            const code: number = this.generateVerificationCode();
            this.verificationCodes.push([email, code]);
            this.emailsService.sendVerificationEmail(code, email, nickname);
        }
    }

    public async updatePassword(email: string, password: string) {

        if (await this.doesUserExist(email)) {
            const hashedPassword = await this.hashPassword(password);

            await UserAdapter.update(
                {
                    Password_Hash: hashedPassword,
                },
                {
                    where: {
                        Email: email
                    }
                });

        } else {
            throw new Error(ERRORS.USER_DOES_NOT_EXIST);
        }
    }

    public async verifyEmail(code: number, email: string) {
        const verifiedCode = this.verificationCodes.filter(vCode => vCode[0] == email && vCode[1] == code).pop();
        if (verifiedCode) {
            this.verificationCodes = this.verificationCodes.filter(vCode => vCode[0] != email);
            await UserAdapter.update(
                {
                    Account_Status: AccountStatus.ACTIVE
                },
                {
                    where: {
                        Email: email
                    }
                });
        } else {
            throw new Error(ERRORS.INVALID_VERIFICATION_CODE);
        }
    }

    public async validateEmail(email: string) {
        if (!(await this.doesUserExist(email))){
            throw new Error(ERRORS.USER_DOES_NOT_EXIST);
        }
    }
    private async createUser(email: string, nickname: string, password: string): Promise<IUser | null> {
        return await UserAdapter.create({
            Account_Status: AccountStatus.UNVERIFIED,
            Address: email,
            Creation_Date: Date.now(),
            Email: email,
            User_Name: nickname,
            Password_Hash: await this.hashPassword(password),
        });
    }

    public async getUser(email: string) {
        console.log("getUser for ",email)
        const user: IUser | null = await this.getByEmail(email);
        if (user) {
            return user;
        } else {
            throw new Error(ERRORS.USER_DOES_NOT_EXIST);
        }
    }
    
    private async doesUserExist(email: string) {
        const user = await this.getByEmail(email);
        return user != null;
    }

    private async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    private generateVerificationCode() {
        const min = 1000;
        const max = 9999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private getToken(user: IUser) {
        const daysExpirationPeriod: number = 60 * 60;
        return jwt.sign({
                id: user.UserID,
                nickname: user.User_Name,
                email: user.Email
            }, process.env.SECRET_KEY as string,
            {
                expiresIn: `${daysExpirationPeriod}s`
            });
    }

}

export default UsersService;