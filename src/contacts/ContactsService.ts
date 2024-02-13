import {Op, Sequelize} from "sequelize";
import EmailsService from "../emails/EmailsService";
import IUser from "../users/models/IUser";
import UserAdapter from "../users/models/UserAdapter";
import UsersService from "../users/UsersService";
import ERRORS from "../utils/ERRORS";
import Contact, {AddContact} from "./models/Contact";
import contactAdapter from "./models/ContactAdapter";
import ContactAdapter from "./models/ContactAdapter";
import PendingContactAdapter from "./models/PendingContactAdapter";

class ContactsService {
    emailsService: EmailsService;
    usersService: UsersService;

    constructor() {
        this.usersService = new UsersService();
        this.emailsService = new EmailsService();
    }

    public async addContact(contact: AddContact) {
        const otherPerson = await this.usersService.getByEmail(contact.otherPersonEmail);
        if (await this.doesContactExist(contact.owner.id as number, otherPerson?.UserID, contact.otherPersonEmail)) {
            throw new Error(ERRORS.CONTACT_ALREADY_EXISTS);
        }
        if (otherPerson != null) {
            const newContact = await ContactAdapter.create(
                {
                    Contact_Description: contact.description,
                    Contact_UserID: otherPerson.UserID,
                    Creation_Date: contact.createdAt,
                    OwnerID: contact.owner.id
                },
            );
            return await this.getContact(newContact.ContactID);
        } else {
            const newContact = await PendingContactAdapter.create(
                {
                    Contact_Description: contact.description,
                    Contact_User_Email: contact.otherPersonEmail,
                    Creation_Date: contact.createdAt,
                    OwnerID: contact.owner.id
                },
            );
            this.emailsService.sendInviteEmail(contact.owner.nickname as string, contact.otherPersonEmail);
            return newContact;
        }
    }

    public async getContact(contactId: number) {
        return await ContactAdapter.findByPk(contactId,
            {
                include: [
                    {
                        model: UserAdapter,
                        as: 'Owner',
                    },
                    {
                        model: UserAdapter,
                        as: 'OtherPerson',
                    },
                ]
            }
        );
    }

    public async getContactByUsersIds(ownerId: number, otherPersonId: number) {
        return await ContactAdapter.findOne(
            {
                where: {
                    OwnerID: ownerId,
                    Contact_UserID: otherPersonId,
                },
                include: [
                    {
                        model: UserAdapter,
                        as: 'Owner',
                    },
                    {
                        model: UserAdapter,
                        as: 'OtherPerson',
                    },
                ]
            }
        );
    }

    public async getContactDescription(ownerId: number, otherPersonId: number) {
        const contact = await this.getContactByUsersIds(ownerId, otherPersonId) as ContactAdapter;
        if (contact)
            return contact?.Contact_Description;
        else
            return "";
    }

    public async getContacts(ownerId: number): Promise<ContactAdapter[]> {
        return await ContactAdapter.findAll(
            {
                where: {
                    OwnerID: ownerId,
                },
                include: [
                    {
                        model: UserAdapter,
                        as: 'OtherPerson',
                    },
                ]
            }
        );
    }

    public async getPendingContactByUsersIds(ownerId: number, otherPersonEmail: string) {
        return await PendingContactAdapter.findOne(
            {
                where: {
                    OwnerID: ownerId,
                    Contact_User_Email: otherPersonEmail,
                },
            }
        );
    }

    public async getPendingContactDescription(ownerId: number, otherPersonEmail: string) {
        let contact;
        if (ownerId != null) contact = await this.getPendingContactByUsersIds(ownerId, otherPersonEmail) as PendingContactAdapter;
        if (contact)
            return contact?.Contact_Description;
        else
            return "";
    }

    public async getPendingContacts(ownerId: number): Promise<PendingContactAdapter[]> {
        return await PendingContactAdapter.findAll(
            {
                where: {
                    OwnerID: ownerId,
                }
            }
        );
    }

    public async getSuggestions() {
        return await ContactAdapter.findAll(
            {
                where: {
                    ContactID: {
                        [Op.lte]: 30,
                    }
                },
                include: {
                    model: UserAdapter,
                    as: 'OtherPerson',
                },
            }
        );
    }

    //User refer to the one that has been added as pending contact and just created his account
    public async setUserPendingContactsToActive(userEmail: string) {
        const user = await this.usersService.getByEmail(userEmail) as IUser;
        const pendingContacts = await PendingContactAdapter.findAll({
            where: {
                Contact_User_Email: userEmail
            }
        });
        pendingContacts.map(async pendingContact => {
            await ContactAdapter.create(
                {
                    Contact_Description: pendingContact.Contact_Description,
                    Contact_UserID: user.UserID,
                    Creation_Date: pendingContact.Creation_Date,
                    OwnerID: pendingContact.OwnerID
                },
            );
            await pendingContact.destroy();
        });

    }

    private async doesContactExist(ownerId: number, otherPersonId?: number, otherPersonEmail?: string) {
        const contact = await ContactAdapter.findOne(
            {
                where: {
                    OwnerID: ownerId,
                    Contact_UserID: otherPersonId || 0,
                },

            }
        );
        const pendingContact = await PendingContactAdapter.findOne(
            {
                where: {
                    OwnerID: ownerId,
                    Contact_User_Email: otherPersonEmail,
                },

            }
        );
        return contact != null || pendingContact != null;
    }
}

export default ContactsService;