import {Op} from "sequelize";
import {Rating} from "../users/models/User";
import UserAdapter from "../users/models/UserAdapter";
import ExchangedGoodAdapter from "./models/exchangedGood/ExchangedGoodAdapter";
import {TransactionStatus} from "./models/Transaction";
import TransactionAdapter from "./models/TransactionAdapter";
import Transaction from "./models/Transaction"
import TransactionParty from "./models/transactionParty/TransactionParty";
import TransactionPartyAdapter from "./models/transactionParty/TransactionPartyAdapter";


class TransactionsService {

    public async approveTransaction(approvalDate: Date, transactionId: number) {
        return await TransactionAdapter.update(
            {
                approvalDate: approvalDate,
                status: TransactionStatus.PROCESSING
            },
            {
                where: {
                    transactionId: transactionId
                }
            });
    }

    public async changeTransactionDetails(transaction: Transaction) {
        await ExchangedGoodAdapter.update(
            transaction.exchangedGood as {}
            ,
            {
                where: {
                    transactionId: transaction.id
                }
            }
        );
        return await TransactionAdapter.update(
            {
                targetedSettlementDate: transaction.target,
                status: TransactionStatus.CHANGED
            },
            {
                where: {
                    transactionId: transaction.id
                }
            }
        );

    }

    public async getTransactionById(transactionId: number) {
        return await TransactionAdapter.findByPk(transactionId, {
            include: [
                {
                    model: TransactionPartyAdapter,
                    as: 'transactionParties',
                },
                {
                    model: ExchangedGoodAdapter,
                    as: 'exchangedGood',
                },
            ]
        });
    }

    public async getTransactionExchangedGood(transactionId: number) {
        return await ExchangedGoodAdapter.findOne({
            where: {
                transactionId: transactionId
            },
        });
    }

    public async getTransactionParties(transactionId: number) {
        return await TransactionPartyAdapter.findAll({
            where: {
                transactionId: transactionId,
            },
            include: [
                {
                    model: UserAdapter,
                    as: 'user',
                },
            ]
        });
    }

    public async getUserTransactionParties(userId: number) {
        return await TransactionPartyAdapter.findAll({
            where: {
                userID: userId,
            },
            include: [
                {
                    model: UserAdapter,
                    as: 'user',
                },
            ]
        });
    }

    public async getUserTransactions(userId: number) {
        const userTransactionParties = await this.getUserTransactionParties(userId);
        return await TransactionAdapter.findAll({
            where: {
                transactionId: {
                    [Op.in]: userTransactionParties.map(trxP => trxP.transactionId)
                },
            },
        });
    }

    public async initiateTransaction(transaction: Transaction) {
        const transactionData = await TransactionAdapter.create(
            {
                initiationDate: transaction.initiationDate,
                status: TransactionStatus.PENDING,
                targetedSettlementDate: transaction.target,
                type: transaction.type
            }
        );

        transaction.exchangedGood.transactionId = transactionData.transactionId;
        await ExchangedGoodAdapter.create(
            transaction.exchangedGood as {}
        );

        for (const party of transaction.parties) {
            await TransactionPartyAdapter.create(
                {
                    role: party.role.join(', '),
                    transactionId: transactionData.transactionId,
                    userID: party.user.id,
                }
            );
        }
        return transactionData;
    }

    public async rateTransactionParty(ratedParty: TransactionParty, userId: number) {
        return await TransactionPartyAdapter.update(
            {
                ratingText: ratedParty.rating?.message,
                ratingValue: ratedParty.rating?.value
            },
            {
                where: {
                    transactionPartyId: ratedParty.transactionId
                }
            }
        );

    }

    public async refuseTransaction(transactionId: number) {
        return await TransactionAdapter.update(
            {
                status: TransactionStatus.REFUSED
            },
            {
                where: {
                    transactionId: transactionId
                }
            });
    }

    public async settleTransaction(settlementDate: Date, transactionId: number, receipt: string | undefined) {
        await TransactionAdapter.update(
            {
                actualSettlementDate: settlementDate,
                status: TransactionStatus.AWAITING_SETTLEMENT_APPROVAL,
                settlementProof: receipt
            },
            {
                where: {
                    transactionId: transactionId
                }
            });
    }

    public async updateTransactionStatus(transactionId: number, status: TransactionStatus) {
        return await TransactionAdapter.update(
            {
                status: status
            },
            {
                where: {
                    transactionId: transactionId
                }
            });
    }


}

export default TransactionsService;