import IPendingTransactionPartyAdapter from "./IPendingTransactionPartyAdapter";
import ITransactionParty from './ITransactionParty';
import {Model, DataTypes} from 'sequelize';
import {sequelize} from '../../../config/sequelize';

class PendingTransactionPartyAdapter extends Model implements IPendingTransactionPartyAdapter {
    email!: string;
    id!: number;
    pendingTransactionId!: number;
    role!: string;
}

PendingTransactionPartyAdapter.init(
    {
        email: {
            type: DataTypes.TEXT,
        },
        role: {
            type: DataTypes.STRING,
        },
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
    },
    {
        modelName: 'PendingTransactionPartyAdapter',
        tableName: 'PendingTransactionParties',
        timestamps: false,
        sequelize
    }
)


export default PendingTransactionPartyAdapter;