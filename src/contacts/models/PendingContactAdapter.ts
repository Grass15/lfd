import UserAdapter from "../../users/models/UserAdapter";
import IContact from "./IContact";
import {Model, DataTypes} from "sequelize";
import {sequelize} from "../../config/sequelize";
import IPendingContactAdapter from "./IPendingContactAdapter";

class PendingContactAdapter extends Model implements IPendingContactAdapter {
    ContactID!: number;
    Contact_Description!: string;
    Contact_User_Email!: string;
    Creation_Date!: Date;
    OwnerID!: number;

}

PendingContactAdapter.init(
    {
        ContactID: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        Contact_Description: {
            type: DataTypes.TEXT,
        },
        Creation_Date: {
            type: DataTypes.DATE,
        },
        Contact_User_Email: {
            type: DataTypes.STRING,
        },
    },
    {
        modelName: 'PendingContactAdapter',
        tableName: 'PendingContacts',
        timestamps: false,
        sequelize
    }
)

export default PendingContactAdapter;