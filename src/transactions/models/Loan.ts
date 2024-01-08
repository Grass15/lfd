import Lender from "../../users/models/Lender";
import Borrower from "../../users/models/Borrower";
import User from "../../users/models/User";
import ITransaction from "./ITransaction";
import Transaction from "./Transaction"

export type LoanInitiationParams = Pick<Transaction, "borrower" | "exchangedGood" | "initiationDate" | "initiator" | "lender" | "status" | "type" | "target">;

class Loan extends Transaction {
    public borrower!: Borrower;
    public lender!: Lender;

    constructor(transaction: ITransaction) {
        super(transaction);
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

}

export default Loan;

