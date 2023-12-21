import UserAdapter from "../../users/models/UserAdapter";
import IContact from "./IContact";
import {Model, DataTypes} from "sequelize";
import {sequelize} from "../../config/sequelize";

class ContactAdapter extends Model implements IContact {
    ContactID!: number;
    Contact_Description!: string;
    Contact_UserID!: number;
    Creation_Date!: Date;
    OwnerID!: number;
}

ContactAdapter.init(
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
    },
    {
        modelName: 'ContactAdapter',
        tableName: 'Contacts',
        timestamps: false,
        sequelize
    }
)

export default ContactAdapter;