import ContactAdapter from "../../contacts/models/ContactAdapter";
import TransactionPartyAdapter from "../../transactions/models/transactionParty/TransactionPartyAdapter";
import IUser from "./IUser";
import {Model, DataTypes} from "sequelize";
import {sequelize} from "../../config/sequelize";

class UserAdapter extends Model implements IUser {
    Account_Status!: string;
    Address?: string;
    Country?: string;
    Creation_Date?: Date;
    Email!: string;
    Password_Hash!: string;
    Phone_Number?: string;
    Profile_Description?: string;
    Profile_Picture!: string;
    Province?: string;
    Social_Credit_Score!: number;
    UserID!: number;
    User_Name!: string;
    hasPassword!: boolean;
}

UserAdapter.init(
    {
        Account_Status: {
            type: DataTypes.STRING(20)
        },
        Address: {
            type: DataTypes.TEXT
        },
        Country: {
            type: DataTypes.TEXT
        },
        Creation_Date: {
            type: DataTypes.DATE
        },
        Email: {
            type: DataTypes.STRING(255)
        },
        Password_Hash: {
            type: DataTypes.STRING(255)
        },
        hasPassword: {
            type: DataTypes.BOOLEAN
        },
        Phone_Number: {
            type: DataTypes.STRING(20)
        },
        Profile_Description: {
            type: DataTypes.TEXT
        },
        Profile_Picture: {
            type: DataTypes.STRING(255)
        },
        Province: {
            type: DataTypes.TEXT
        },
        Social_Credit_Score: {
            type: DataTypes.INTEGER
        },
        UserID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        User_Name: {
            type: DataTypes.STRING(255)
        },
    },
    {
        modelName: 'UserAdapter',
        tableName: 'Users',
        timestamps: false,
        sequelize
    }
)

ContactAdapter.belongsTo(UserAdapter, {foreignKey: 'OwnerID', as: 'Owner'});
ContactAdapter.belongsTo(UserAdapter, {foreignKey: 'Contact_UserID', as: 'OtherPerson'});

TransactionPartyAdapter.belongsTo(UserAdapter, {foreignKey: 'userID', as: 'user'});


export default UserAdapter;


