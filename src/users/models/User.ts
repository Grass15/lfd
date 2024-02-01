import IUser from "./IUser";

class User {
    accountStatus: string;
    address?: string;
    country?: string;
    createdAt?: Date;
    description?: string;
    email: string;
    hasPassword: boolean;
    readonly id: number;
    nickname!: string;
    phoneNumber?: string;
    picture: string;
    trustScore: number;

    constructor(user: IUser | undefined) {
        this.accountStatus = user?.Account_Status as string;
        this.address = user?.Address;
        this.createdAt = user?.Creation_Date;
        this.country = user?.Country;
        this.email = user?.Email as string;
        this.id = user?.UserID as number;
        this.nickname = user?.User_Name as string;
        this.hasPassword = user?.hasPassword as boolean;
        this.phoneNumber = user?.Phone_Number;
        this.picture = user?.Profile_Picture as string;
        this.trustScore = user?.Social_Credit_Score as number;
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