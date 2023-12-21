import ITransaction from './ITransaction';
import {Model, DataTypes} from 'sequelize';
import {sequelize} from '../../config/sequelize';
import {TransactionStatus, TransactionType} from "./Transaction";
import UserAdapter from "../../users/models/UserAdapter";

class TransactionAdapter extends Model implements ITransaction {
    Borrowed_Amount?: number;
    Borrowed_Currency?: string;
    BorrowerID!: number;
    Description!: string;
    Detail?: string;
    Image_Of_Item?: string;
    Initiation_Date?: Date;
    InitiatorID!: number;
    Item_Name?: string;
    LenderID!: number;
    Payment_MethodID?: number;
    Proof?: string;
    Repayment_MethodID?: number;
    Repayment_Terms?: string;
    Returned_Amount?: number;
    Returned_Currency?: string;
    Status!: TransactionStatus;
    Target_Date?: Date;
    TransactionID!: number;
    Transaction_Date?: Date;
    Transaction_Rating_Borrower?: number;
    Transaction_Rating_Borrower_Message?: string;
    Transaction_Rating_Lender?: number;
    Transaction_Rating_Lender_Message?: string;
    Transaction_Returned_Date?: Date;
    Transaction_Topic_Name?: string;
    Transaction_Type!: TransactionType;
}

TransactionAdapter.init(
    {
        Borrowed_Amount: {
            type: DataTypes.DECIMAL,
        },
        Borrowed_Currency: {
            type: DataTypes.STRING(3),
        },
        Description: {
            type: DataTypes.TEXT,
        },
        Detail: {
            type: DataTypes.TEXT,
        },
        Image_Of_Item: {
            type: DataTypes.STRING(255),
        },
        Item_Name: {
            type: DataTypes.STRING(255),
        },
        Initiation_Date: {
            type: DataTypes.DATE,
        },
        Payment_MethodID: {
            type: DataTypes.INTEGER,
        },
        Proof: {
            type: DataTypes.STRING(255),
        },
        Repayment_MethodID: {
            type: DataTypes.INTEGER,
        },
        Repayment_Terms: {
            type: DataTypes.STRING,
        },
        Returned_Amount: {
            type: DataTypes.DECIMAL,
        },
        Returned_Currency: {
            type: DataTypes.STRING(3),
        },
        Status: {
            type: DataTypes.ENUM('Pending', 'Processing', 'Settled', 'Refused'),
        },
        Target_Date: {
            type: DataTypes.DATE,
        },
        TransactionID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        Transaction_Date: {
            type: DataTypes.DATE,
        },
        Transaction_Rating_Borrower: {
            type: DataTypes.INTEGER,
        },
        Transaction_Rating_Borrower_Message: {
            type: DataTypes.TEXT,
        },
        Transaction_Rating_Lender: {
            type: DataTypes.INTEGER,
        },
        Transaction_Rating_Lender_Message: {
            type: DataTypes.TEXT,
        },
        Transaction_Returned_Date: {
            type: DataTypes.DATE,
        },
        Transaction_Topic_Name: {
            type: DataTypes.TEXT,
        },
        Transaction_Type: {
            type: DataTypes.ENUM('Cash', 'Item', 'Other'),
        },
    },
    {
        modelName: 'TransactionAdapter',
        tableName: 'Transactions',
        timestamps: false,
        sequelize
    }
)


export default TransactionAdapter;