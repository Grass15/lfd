import User from "../../users/models/User";
import ITransaction from "./ITransaction";
import {ExchangedGood} from "./exchangedGood/ExchangedGood";
import TransactionParty from "./transactionParty/TransactionParty";

class Transaction {
    public readonly approvalDate?: Date;
    public exchangedGood!: ExchangedGood;
    readonly id?: number;
    public readonly initiationDate?: Date;
    public parties!: TransactionParty[];
    public readonly settlementDate?: Date;
    public status!: TransactionStatus;
    public target?: Date;
    public type: TransactionType;

    constructor(transaction: ITransaction) {
        this.approvalDate = transaction.approvalDate;
        this.id = transaction.transactionId;
        this.initiationDate = transaction.initiationDate;
        this.status = transaction.status || TransactionStatus.PENDING;
        this.target = transaction.targetedSettlementDate;
        this.type = transaction.type;
    }

    addParty(party: TransactionParty): void {
        this.parties = this.parties == undefined ? [] : this.parties;
        this.parties.push(party);
    }

    private setExchangedGoodDetails(exchangedGood: ExchangedGood) {

    }


}


export interface ApprovalReceiptParams {
    description: string,
    email: string,
    friendName: string
    nickname: string,
    transactionId: number,
    transactionType: string,
    transactionValue: string,
}


export enum TransactionPartyRoles {
    BORROWER = "borrower",
    INITIATOR = "initiator",
    LENDER = "lender",
    RECEIVER = "receiver",
    SENDER = "sender",
    WITNESS = "witness",
}

export enum TransactionStatus {
    AWAITING_CHANGE_APPROVAL = "awaiting_change_approval",
    AWAITING_SETTLEMENT_APPROVAL = "awaiting_settlement_approval",
    CHANGED = "changed",
    PENDING = "pending",
    PROCESSING = "processing",
    SETTLED = "settled",
    REFUSED = "refused"
}

export enum TransactionType {
    LOAN = "loan",
    OTHER = "other",
}


export default Transaction;

