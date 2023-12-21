import {TransactionStatus, TransactionType} from "./Transaction";

interface ITransaction {
    Borrowed_Amount?: number;
    Borrowed_Currency?: string;
    BorrowerID: number;
    Description: string;
    Detail?: string;
    Image_Of_Item?: string;
    Initiation_Date?: Date;
    InitiatorID: number;
    Item_Name?: string;
    LenderID: number;
    Payment_MethodID?: number;
    Proof?: string;
    Repayment_MethodID?: number;
    Repayment_Terms?: string;
    Returned_Amount?: number;
    Returned_Currency?: string;
    Status: TransactionStatus;
    Target_Date?: Date;
    TransactionID: number;
    Transaction_Date?: Date;
    Transaction_Rating_Borrower?: number;
    Transaction_Rating_Borrower_Message?: string;
    Transaction_Rating_Lender?: number;
    Transaction_Rating_Lender_Message?: string;
    Transaction_Returned_Date?: Date;
    Transaction_Topic_Name?: string;
    Transaction_Type: TransactionType;
}

export default ITransaction;