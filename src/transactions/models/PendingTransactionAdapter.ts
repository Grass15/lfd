import ExchangedGoodAdapter from "./exchangedGood/ExchangedGoodAdapter";
import {ExchangedGoodType} from "./exchangedGood/IExchangedGood";
import PendingExchangedGoodAdapter from "./exchangedGood/PendingExchangedGoodAdapter";
import IPendingTransactionAdapter from "./IPendingTransactionAdapter";
import {Model, DataTypes} from 'sequelize';
import {sequelize} from '../../config/sequelize';
import {TransactionType} from "./Transaction";
import TransactionAdapter from "./TransactionAdapter";
import PendingTransactionPartyAdapter from "./transactionParty/PendingTransactionPartyAdapter";

class PendingTransactionAdapter extends Model implements IPendingTransactionAdapter {
    id!: number;
    initiationDate!: Date;
    targetedSettlementDate!: Date;
    type!: TransactionType;
}

PendingTransactionAdapter.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        initiationDate: {
            type: DataTypes.DATE,
        },
        targetedSettlementDate: {
            type: DataTypes.DATE,
        },
        type: {
            type: DataTypes.ENUM('loan', 'other'),
        },

    },
    {
        modelName: 'PendingTransactionAdapter',
        tableName: 'PendingTransactions',
        timestamps: false,
        sequelize
    }
)
PendingExchangedGoodAdapter.belongsTo(PendingTransactionAdapter, {
    foreignKey: 'transactionId',
    as: 'pendingTransaction'
});
PendingTransactionPartyAdapter.belongsTo(PendingTransactionAdapter, {
    foreignKey: 'pendingTransactionId',
    as: 'pendingTransaction'
});
PendingTransactionAdapter.hasMany(PendingTransactionPartyAdapter, {
    foreignKey: 'pendingTransactionId',
    as: 'pendingTransactionParties'
});
PendingTransactionAdapter.hasOne(PendingExchangedGoodAdapter, {
    foreignKey: 'transactionId',
    as: 'exchangedGood'
});


export default PendingTransactionAdapter;