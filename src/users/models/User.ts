import IUser from "./IUser";

class User {
    accountStatus: string;
    address?: string;
    country?: string;
    createdAt?: Date;
    description?: string;
    readonly email: string;
    readonly id: number;
    nickname!: string;
    phoneNumber?: string;
    picture: string;
    trustScore: number;

    constructor(user: IUser) {
        this.accountStatus = user.Account_Status;
        this.address = user.Address;
        this.createdAt = user.Creation_Date;
        this.country = user.Country;
        this.email = user.Email;
        this.id = user.UserID;
        this.nickname = user.User_Name;
        this.phoneNumber = user.Phone_Number;
        this.picture = user.Profile_Picture;
        this.trustScore = user.Social_Credit_Score;
    }
}

export interface Rating {
    message?: string;
    value?: number;
}

export enum AccountStatus {
    UNVERIFIED = "unverified",
    ACTIVE = "active",
    SUSPENDED = "suspended"
}

export interface LoginResponse {
    token: string;
    userData: IUser;
}

export default User;