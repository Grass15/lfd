import borrower from "../../users/models/Borrower";
import lender from "../../users/models/Lender";
import ITransaction from "./ITransaction";
import Transaction, {TransactionPartyRoles} from "./Transaction"
import TransactionParty from "./transactionParty/TransactionParty";

class Loan extends Transaction {
    public borrower!: TransactionParty;
    public initiator!: TransactionParty;
    public lender!: TransactionParty;
    public witness: TransactionParty[] = [];

    constructor(transaction: ITransaction) {
        super(transaction);
    }

    public setBorrower(borrower: TransactionParty) {
        this.borrower = borrower;
        this.addParty(borrower);
    }

    public setInitiator(initiator: TransactionParty) {
        if (lender == null || borrower == null) throw new Error();
        else {
            this.initiator = initiator;
            this.parties.forEach(transactionParty => {
                if (transactionParty.transactionPartyId == initiator.transactionPartyId) {
                    //transactionParty.role.push(TransactionPartyRoles.INITIATOR);
                    this.initiator.user.nickname = transactionParty.user.nickname;
                    return;
                }
            })
        }

    }

    public setLender(lender: TransactionParty) {
        this.lender = lender;
        this.addParty(lender);
    }

    public setWitness(witness: TransactionParty){
        console.log("setWitness: ",witness)
        this.witness.push(witness);
        this.addParty(witness);
        // console.log("all data witness", this.witness)
        // console.log("all data lender", this.lender)
    }

}

export default Loan;

