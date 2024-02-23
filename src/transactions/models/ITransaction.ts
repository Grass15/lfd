import {TransactionStatus, TransactionType} from "./Transaction";

interface ITransaction {
    actualSettlementDate?: Date;
    approvalDate?: Date;
    initiationDate?: Date;
    previousTargetedSettlementDate?: Date;
    settlementProof: string;
    status: TransactionStatus;
    targetedSettlementDate?: Date;
    transactionId: number;
    type: TransactionType;
}


export default ITransaction;