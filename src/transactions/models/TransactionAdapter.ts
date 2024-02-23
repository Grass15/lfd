import ExchangedGoodAdapter from "./exchangedGood/ExchangedGoodAdapter";
import ITransaction from './ITransaction';
import {Model, DataTypes} from 'sequelize';
import {sequelize} from '../../config/sequelize';
import {TransactionStatus} from "./Transaction";
import UserAdapter from "../../users/models/UserAdapter";
import {TransactionType} from "./Transaction";
import TransactionPartyAdapter from "./transactionParty/TransactionPartyAdapter";

class TransactionAdapter extends Model implements ITransaction {
    actualSettlementDate?: Date;
    approvalDate?: Date;
    initiationDate!: Date;
    previousTargetedSettlementDate?: Date;
    settlementProof!: string;
    status!: TransactionStatus;
    targetedSettlementDate!: Date;
    transactionId!: number;
    type!: TransactionType;
}

TransactionAdapter.init(
    {
        actualSettlementDate: {
            type: DataTypes.DATE,
        },
        approvalDate: {
            type: DataTypes.DATE,
        },
        initiationDate: {
            type: DataTypes.DATE,
        },
        previousTargetedSettlementDate: {
            type: DataTypes.DATE,
        },
        settlementProof: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.ENUM("awaiting_change_approval", "awaiting_settlement_approval", "changed", "pending", "processing", "settled", "refused"),
        },
        targetedSettlementDate: {
            type: DataTypes.DATE,
        },
        transactionId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        type: {
            type: DataTypes.ENUM('loan', 'other'),
        },

    },
    {
        modelName: 'TransactionAdapter',
        tableName: 'Transactions',
        timestamps: false,
        sequelize
    }
)

ExchangedGoodAdapter.belongsTo(TransactionAdapter, {foreignKey: 'transactionId', as: 'transaction'});
TransactionPartyAdapter.belongsTo(TransactionAdapter, {foreignKey: 'transactionId', as: 'transaction'});
TransactionAdapter.hasOne(ExchangedGoodAdapter, {foreignKey: 'transactionId', as: 'exchangedGood'});
TransactionAdapter.hasMany(TransactionPartyAdapter, {foreignKey: 'transactionId', as: 'transactionParties'});


export default TransactionAdapter;