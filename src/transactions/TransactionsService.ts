import {Op} from "sequelize";
import EmailsService from "../emails/EmailsService";
import UserAdapter from "../users/models/UserAdapter";
import UsersService from "../users/UsersService";
import ExchangedGoodAdapter from "./models/exchangedGood/ExchangedGoodAdapter";
import {TransactionPartyRoles} from "./models/Transaction";
import PendingExchangedGoodAdapter from "./models/exchangedGood/PendingExchangedGoodAdapter";
import PendingTransactionAdapter from "./models/PendingTransactionAdapter";
import Transaction, {TransactionStatus} from "./models/Transaction";
import TransactionAdapter from "./models/TransactionAdapter";
import PendingTransactionPartyAdapter from "./models/transactionParty/PendingTransactionPartyAdapter";
import TransactionParty from "./models/transactionParty/TransactionParty";
import TransactionPartyAdapter from "./models/transactionParty/TransactionPartyAdapter";


class TransactionsService {
    usersService: UsersService;

    constructor() {
        this.usersService = new UsersService();
    }

    public async addPendingTransaction(transaction: Transaction) {
        const pendingTransactionData = await PendingTransactionAdapter.create(
            this.getPendingTransactionCreationData(transaction)
        );
        transaction.exchangedGood.transactionId = pendingTransactionData.id;
        await PendingExchangedGoodAdapter.create(
            transaction.exchangedGood as {}
        );
        for (const party of transaction.parties) {
            await PendingTransactionPartyAdapter.create(
                {
                    role: party.role.join(', '),
                    pendingTransactionId: pendingTransactionData.id,
                    email: party.user.email,
                }
            );
        }
        return pendingTransactionData;
    }

    public async approveTransaction(approvalDate: Date, transactionId: number) {
        const witnesses = await TransactionPartyAdapter.findAll({
            where: {
                transactionId: transactionId,
                role: TransactionPartyRoles.WITNESS
            }
        });
        const allApproved = witnesses.every(witness => witness.approved);
        if (allApproved) {

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
        else{
            throw new Error("Not all witnesses have approved the transaction");
        }
    }

    public async approveWitnessTransaction(approvalDate: Date, userId:number,transactionId: number) {
        return await TransactionPartyAdapter.update(
            {
                // approvalDate: approvalDate,
                approved: true,
            },
            {
                where: {
                    transactionId: transactionId,
                    userID: userId,
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

    public async getPendingTransactionById(pendingTransactionId: number) {
        return await PendingTransactionAdapter.findByPk(pendingTransactionId, {
            include: [
                {
                    model: PendingTransactionPartyAdapter,
                    as: 'pendingTransactionParties',
                },
                {
                    model: PendingExchangedGoodAdapter,
                    as: 'exchangedGood',
                },
            ]
        });
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

    public async getUserPendingTransactionParties(userEmail: string) {
        return await PendingTransactionPartyAdapter.findAll({
            where: {
                email: userEmail,
            }
        });
    }

    public async getUserPendingTransactions(userEmail: string) {
        const userTransactionParties = await this.getUserPendingTransactionParties(userEmail);
        return await PendingTransactionAdapter.findAll({
            where: {
                id: {
                    [Op.in]: userTransactionParties.map(trxP => trxP.pendingTransactionId)
                },
            },
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
        if (this.doesContainPendingUser(transaction)) {
            return await this.addPendingTransaction(transaction);
        } else {
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

    public async setUserPendingTransactionsToActive(userEmail: string, userId: number) {
        console.log(userEmail);
        console.log(userId);
        const userTransactionParties = await this.getUserPendingTransactionParties(userEmail);
        const pendingTransactions = await PendingTransactionAdapter.findAll({
            where: {
                id: {
                    [Op.in]: userTransactionParties.map(trxP => trxP.pendingTransactionId)
                },
            },
            include: [
                {
                    model: PendingTransactionPartyAdapter,
                    as: 'pendingTransactionParties',
                },
                {
                    model: PendingExchangedGoodAdapter,
                    as: 'exchangedGood',
                },
            ]
        });
        for (const transaction of pendingTransactions) {
            const transactionData = await TransactionAdapter.create(
                {
                    initiationDate: transaction.initiationDate,
                    status: TransactionStatus.PENDING,
                    targetedSettlementDate: transaction.targetedSettlementDate,
                    type: transaction.type
                }
            );

            const exchangedGood = transaction.get('exchangedGood') as PendingExchangedGoodAdapter;
            exchangedGood.transactionId = transactionData.transactionId;
            console.log(exchangedGood)
            await ExchangedGoodAdapter.create(
                {
                    amount: exchangedGood.amount,
                    currency: exchangedGood.currency,
                    description: exchangedGood.description,
                    image: exchangedGood.image,
                    itemName: exchangedGood.itemName,
                    topicName: exchangedGood.topicName,
                    transactionId: transactionData.transactionId,
                    type: exchangedGood.type,
                }
            );
            await exchangedGood.destroy();
            const parties = transaction.get('pendingTransactionParties') as PendingTransactionPartyAdapter[];

            for (const party of parties) {
                await TransactionPartyAdapter.create(
                    {
                        role: party.role,
                        transactionId: transactionData.transactionId,
                        userID: party.email == userEmail ? userId : (await this.usersService.getUser(party.email)).UserID,
                    }
                );
                await party.destroy();
            }
            await transaction.destroy();
        }
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

    private doesContainPendingUser(transaction: Transaction): boolean {
        return transaction.parties.filter(party => party.user.id == null || party.user.id == 0).length > 0;
    }

    private getPendingTransactionCreationData(transaction: Transaction) {
        let pendingTransactionData: { [key: string]: any } = {
            initiationDate: transaction.initiationDate,
            targetedSettlementDate: transaction.target,
            type: transaction.type
        };
        // Object.assign(pendingTransactionData, transaction.exchangedGood);
        // pendingTransactionData['exchangedGoodType'] = transaction.exchangedGood.type;
        // delete pendingTransactionData['type'];
        return pendingTransactionData;
    }


}

export default TransactionsService;