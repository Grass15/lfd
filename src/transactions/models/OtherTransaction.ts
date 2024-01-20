import ITransaction from "./ITransaction";
import Transaction, {TransactionPartyRoles} from "./Transaction"
import TransactionParty from "./transactionParty/TransactionParty";

class OtherTransaction extends Transaction {
    public receiver!: TransactionParty;
    public sender!: TransactionParty;

    constructor(transaction: ITransaction) {
        super(transaction);
    }

    public setReceiver(receiver: TransactionParty) {
        this.receiver = receiver;
        this.addParty(receiver);
    }

    public setSender(sender: TransactionParty) {
        this.sender = sender;
        this.addParty(sender);
    }
}

export default OtherTransaction;

