interface IUser {
    Account_Status: string;
    Address?: string;
    Country?: string;
    Creation_Date?: Date;
    Email: string;
    Password_Hash: string;
    Phone_Number?: string;
    Profile_Description?: string;
    Profile_Picture: string;
    Province?: string;
    Social_Credit_Score: number;
    UserID: number;
    User_Name: string;
}

export default IUser;