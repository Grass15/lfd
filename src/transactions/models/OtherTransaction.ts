import ITransaction from "./ITransaction";
import Transaction, {TransactionPartyRoles} from "./Transaction"
import TransactionParty from "./transactionParty/TransactionParty";

class OtherTransaction extends Transaction {
    public receiver!: TransactionParty;
    public sender!: TransactionParty;
    public witness: TransactionParty[] = [];

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
    
    public setWitness(witness: TransactionParty){
        console.log("setWitness: ",witness)
        this.witness.push(witness);
        this.addParty(witness);
        // console.log("all data witness", this.witness)
        // console.log("all data lender", this.lender)
    }
}

export default OtherTransaction;

