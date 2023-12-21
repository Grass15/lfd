import Lender from "../../users/models/Lender";
import Borrower from "../../users/models/Borrower";
import User from "../../users/models/User";
import ITransaction from "./ITransaction";
import {Cash, ExchangedGood, Item, Other} from "./ExchangedGood";

export type TransactionInitiationParams = Pick<Transaction, "borrower" | "exchangedGood" | "initiationDate" | "initiator" | "lender" | "status" | "type" | "target">;

class Transaction {
    public readonly approvalDate?: Date;
    public borrower!: Borrower;
    public exchangedGood!: ExchangedGood;
    readonly id?: number;
    public readonly initiationDate?: Date;
    public initiator!: User;
    public lender!: Lender;
    public readonly settlementDate?: Date;
    public status!: TransactionStatus;
    public target?: Date;
    public type!: TransactionType;

    constructor(transaction: ITransaction) {
        this.approvalDate = transaction.Transaction_Date;
        this.setExchangedGoodDetails(transaction);
        this.id = transaction.TransactionID;
        this.initiationDate = transaction.Initiation_Date;
        this.settlementDate = transaction.Transaction_Returned_Date;
        this.status = transaction.Status;
        this.target = transaction.Target_Date;
        this.type = transaction.Transaction_Type;
    }

    public setBorrower(borrower: Borrower) {
        this.borrower = borrower;
    }

    public setInitiator(initiator: User) {
        this.initiator = initiator;
    }

    public setLender(lender: Lender) {
        this.lender = lender;
    }

    private setExchangedGoodDetails(transaction: ITransaction) {
        if (transaction.Borrowed_Amount) {
            this.exchangedGood = new Cash(transaction.Description, transaction.Borrowed_Amount, transaction.Borrowed_Currency);
        } else if (transaction.Transaction_Topic_Name) {
            this.exchangedGood = new Other(transaction.Description, transaction.Transaction_Topic_Name);
        } else {
            this.exchangedGood = new Item(transaction.Description, transaction.Item_Name as string, transaction.Image_Of_Item); //Need to add item name in db
        }
    }


}

export enum TransactionStatus {
    PENDING = "Pending",
    PROCESSING = "Processing",
    SETTLED = "Settled",
    REFUSED = "Refused"
}

export enum TransactionType {
    CASH = 'Cash',
    ITEM = "Item",
    OTHER = "Other"
}

export default Transaction;

