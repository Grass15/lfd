import IExchangedGood, {ExchangedGoodType} from './IExchangedGood';
import {Model, DataTypes} from 'sequelize';
import {sequelize} from '../../../config/sequelize';

class PendingExchangedGoodAdapter extends Model implements IExchangedGood {
    amount?: number;
    currency?: string;
    description!: string;
    exchangeGoodId!: number;
    image?: string;
    itemName?: string;
    topicName?: string;
    transactionId!: number;
    type!: ExchangedGoodType;
}

PendingExchangedGoodAdapter.init(
    {
        amount: {
            type: DataTypes.DECIMAL,
        },
        currency: {
            type: DataTypes.STRING(5),
        },
        description: {
            type: DataTypes.TEXT,
        },
        exchangedGoodId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        image: {
            type: DataTypes.STRING,
        },
        itemName: {
            type: DataTypes.STRING,
        },
        topicName: {
            type: DataTypes.STRING,
        },
        type: {
            type: DataTypes.ENUM('cash', 'item', 'other'),
        },
    },
    {
        modelName: 'PendingExchangedGoodAdapter',
        tableName: 'PendingExchangedGoods',
        timestamps: false,
        sequelize
    }
)


export default PendingExchangedGoodAdapter;