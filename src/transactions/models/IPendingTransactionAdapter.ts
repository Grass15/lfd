import {ExchangedGoodType} from "./exchangedGood/IExchangedGood";
import {TransactionType} from "./Transaction";

interface IPendingTransactionAdapter {
    id: number;
    initiationDate?: Date;
    targetedSettlementDate?: Date;
    type: TransactionType;
}


export default IPendingTransactionAdapter;