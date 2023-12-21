import ContactAdapter from "../../contacts/models/ContactAdapter";
import TransactionAdapter from "../../transactions/models/TransactionAdapter";
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

TransactionAdapter.belongsTo(UserAdapter, {foreignKey: 'LenderID', as: 'Lender'});
TransactionAdapter.belongsTo(UserAdapter, {foreignKey: 'BorrowerID', as: 'Borrower'});
TransactionAdapter.belongsTo(UserAdapter, {foreignKey: 'InitiatorID', as: 'Initiator'});
ContactAdapter.belongsTo(UserAdapter, {foreignKey: 'OwnerID', as: 'Owner'});
ContactAdapter.belongsTo(UserAdapter, {foreignKey: 'Contact_UserID', as: 'OtherPerson'});


export default UserAdapter;


