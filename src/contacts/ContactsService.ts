import {Op, Sequelize} from "sequelize";
import EmailsService from "../emails/EmailsService";
import IUser from "../users/models/IUser";
import UserAdapter from "../users/models/UserAdapter";
import UsersService from "../users/UsersService";
import ERRORS from "../utils/ERRORS";
import Contact, {AddContact} from "./models/Contact";
import contactAdapter from "./models/ContactAdapter";
import ContactAdapter from "./models/ContactAdapter";

class ContactsService {
    emailsService: EmailsService;
    usersService: UsersService;

    constructor() {
        this.usersService = new UsersService();
        this.emailsService = new EmailsService();
    }

    public async addContact(contact: AddContact) {
        const otherPerson = await this.usersService.getByEmail(contact.otherPersonEmail);
        if (otherPerson != null) {
            if (await this.doesContactExist(contact.owner.id, otherPerson.UserID)) {
                throw new Error(ERRORS.CONTACT_ALREADY_EXISTS);
            } else {
                console.log(contact.owner.nickname, contact.otherPersonEmail)
                console.log(contact)
                const newContact = await ContactAdapter.create(
                    {
                        Contact_Description: contact.description,
                        Contact_UserID: otherPerson.UserID,
                        Creation_Date: contact.createdAt,
                        OwnerID: contact.owner.id
                    },
                );
                return await this.getContact(newContact.ContactID)
            }
        } else {
            console.log(contact.owner.nickname, contact.otherPersonEmail)
            this.emailsService.sendInviteEmail(contact.owner.nickname, contact.otherPersonEmail);
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

    private async doesContactExist(ownerId: number, otherPersonId: number) {
        const contact = await ContactAdapter.findOne(
            {
                where: {
                    OwnerID: ownerId,
                    Contact_UserID: otherPersonId,
                },

            }
        );
        return contact != null;
    }
}

export default ContactsService;