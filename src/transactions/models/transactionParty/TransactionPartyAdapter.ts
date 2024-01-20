import ITransactionParty from './ITransactionParty';
import {Model, DataTypes} from 'sequelize';
import {sequelize} from '../../../config/sequelize';

class TransactionPartyAdapter extends Model implements ITransactionParty {
    ratingText?: string;
    ratingValue?: number;
    role!: string;
    transactionId!: number;
    transactionPartyId!: number;
    userId!: number;
}

TransactionPartyAdapter.init(
    {
        ratingText: {
            type: DataTypes.TEXT,
        },
        ratingValue: {
            type: DataTypes.INTEGER,
        },
        role: {
            type: DataTypes.STRING,
        },
        transactionPartyId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
    },
    {
        modelName: 'TransactionPartyAdapter',
        tableName: 'TransactionParties',
        timestamps: false,
        sequelize
    }
)


export default TransactionPartyAdapter;