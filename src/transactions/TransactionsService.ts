import {Op, Sequelize} from "sequelize";
import IUser from "../users/models/IUser";
import {Rating} from "../users/models/User";
import UserAdapter from "../users/models/UserAdapter";
import ITransaction from "./models/ITransaction";
import Transaction, {TransactionInitiationParams, TransactionStatus, TransactionType} from './models/Transaction';
import TransactionAdapter from './models/TransactionAdapter';


class TransactionsService {

    public async approveTransaction(approvalDate: Date, transactionId: number) {
        return await TransactionAdapter.update(
            {
                Transaction_Date: approvalDate,
                Status: TransactionStatus.PROCESSING
            },
            {
                where: {
                    TransactionID: transactionId
                }
            });
    }

    public async getBorrowedTransactions(userId: number) {
        return await TransactionAdapter.findAll({
            where: {
                BorrowerID: userId,
            },
            include: [
                {
                    model: UserAdapter,
                    as: 'Lender',
                },
                {
                    model: UserAdapter,
                    as: 'Borrower',
                },
                {
                    model: UserAdapter,
                    as: 'Initiator',
                },
            ]
        });
    }

    public async getLentTransactions(userId: number) {
        return await TransactionAdapter.findAll({
            where: {
                LenderID: userId,
            },
            include: [
                {
                    model: UserAdapter,
                    as: 'Lender',
                },
                {
                    model: UserAdapter,
                    as: 'Borrower',
                },
                {
                    model: UserAdapter,
                    as: 'Initiator',
                },
            ]
        });
    }

    public async getTransactionBorrower(transactionId: number) {
        return await TransactionAdapter.findByPk(transactionId, {
            include: {
                model: UserAdapter,
                as: 'Borrower',
            }
        });
    }

    public async getTransactionById(transactionId: number) {
        return await TransactionAdapter.findByPk(transactionId, {
            include: [
                {
                    model: UserAdapter,
                    as: 'Lender',
                },
                {
                    model: UserAdapter,
                    as: 'Borrower',
                },
                {
                    model: UserAdapter,
                    as: 'Initiator',
                },
            ]
        });
    }

    public async getTransactionLender(transactionId: number) {
        return await TransactionAdapter.findByPk(transactionId, {
            include: {
                model: UserAdapter,
                as: 'Lender',
            }
        });
    }

    public async initiateTransaction(transaction: TransactionInitiationParams) {
        let transactionExchangedGood = this.getExchangedGood(transaction);
        console.log(transactionExchangedGood)
        let transactionCreationValues = {
            BorrowerID: transaction.borrower.id,
            Initiation_Date: transaction.initiationDate,
            InitiatorID: transaction.initiator.id,
            LenderID: transaction.lender.id,
            Status: TransactionStatus.PENDING,
            Target_Date: transaction.target,
            Transaction_Type: transaction.type,
        }
        Object.assign(transactionCreationValues, transactionExchangedGood)
        return await TransactionAdapter.create(
            transactionCreationValues
        );
    }

    public async rateTransaction(transaction: Transaction, userId: number) {
        let updateParams;
        if (userId == transaction.lender.id) {
            const rating = transaction.borrower.rating as Rating
            await TransactionAdapter.update(
                {
                    Transaction_Rating_Borrower: rating.value,
                    Transaction_Rating_Borrower_Message: rating.message,
                },
                {
                    where: {
                        TransactionID: transaction.id
                    }
                });
        } else {
            const rating = transaction.lender.rating as Rating
            await TransactionAdapter.update(
                {
                    Transaction_Rating_Lender: rating.value,
                    Transaction_Rating_Lender_Message: rating.message,
                },
                {
                    where: {
                        TransactionID: transaction.id
                    }
                });
        }
        return await TransactionAdapter.update(
            {
                Transaction_Rating_Borrower: transaction.borrower.rating?.value,
                Transaction_Rating_Borrower_Message: transaction.borrower.rating?.message,
            },
            {
                where: {
                    TransactionID: transaction.id
                }
            });
    }

    public async refuseTransaction(transactionId: number) {
        return await TransactionAdapter.update(
            {
                Status: TransactionStatus.REFUSED
            },
            {
                where: {
                    TransactionID: transactionId
                }
            });
    }

    public async settleTransaction(settlementDate: Date, transactionId: number, receipt: string | undefined) {
        await TransactionAdapter.update(
            {
                Transaction_Returned_Date: settlementDate,
                Status: TransactionStatus.SETTLED
            },
            {
                where: {
                    TransactionID: transactionId
                }
            });
    }

    private getExchangedGood(transaction: TransactionInitiationParams) {
        let transactionExchangedGood: any = {};
        const exchangedGood: any = transaction.exchangedGood;
        transactionExchangedGood["Description"] = exchangedGood.description;
        if (transaction.type == TransactionType.CASH.toLowerCase()) {
            transactionExchangedGood["Borrowed_Amount"] = exchangedGood.amount;
            transactionExchangedGood["Borrowed_Currency"] = exchangedGood.currency;
        } else if (transaction.type == TransactionType.ITEM.toLowerCase()) {
            transactionExchangedGood["Item_Name"] = exchangedGood.designation;
            transactionExchangedGood["Image_Of_Item"] = exchangedGood.image;
        } else {
            transactionExchangedGood["Transaction_Topic_Name"] = exchangedGood.topic;
        }
        return transactionExchangedGood;
    }
}

export default TransactionsService;