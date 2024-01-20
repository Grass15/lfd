import User from "../../../users/models/User";
import {TransactionPartyRoles} from "../Transaction";
import ITransactionParty from "./ITransactionParty";

class TransactionParty {
    rating?: Rating;
    role!: TransactionPartyRoles[];
    transactionId: number;
    transactionPartyId: number;
    user!: User;

    constructor(transactionParty: ITransactionParty) {
        this.rating = {
            message: transactionParty.ratingText,
            value: transactionParty.ratingValue,
        };
        this.setRole(transactionParty.role);
        this.transactionId = transactionParty.transactionId;
        this.transactionPartyId = transactionParty.transactionPartyId;
    }

    public setRole(roles: string) {
        this.role = this.role == undefined ? [] : this.role;
        console.log(roles)
        console.log("roles", this.role)
        roles.split(', ').forEach(role => {
            this.role.push(role as TransactionPartyRoles);
        })
    }

    private reverseMap(enumObj: any, value: string) {
        return Object.keys(enumObj).find(key => {
            enumObj[key] === value

        });
    }
}

export interface Rating {
    message?: string;
    value?: number;
}

export default TransactionParty;