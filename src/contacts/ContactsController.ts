import {Response} from "express";
import {Body, BodyParam, Get, JsonController, Param, Post, Res} from "routing-controllers";
import EmailsService from "../emails/EmailsService";
import IUser from "../users/models/IUser";
import User from "../users/models/User";
import UsersService from "../users/UsersService";
import BaseController from "../utils/BaseController";
import ContactsService from "./ContactsService";
import Contact, {AddContact, ContactStatus} from "./models/Contact";
import ContactAdapter from "./models/ContactAdapter";

@JsonController("/api/contacts")
class ContactsController extends BaseController {

    emailService: EmailsService;
    service: ContactsService;
    userService: UsersService;

    constructor() {
        super();
        this.service = new ContactsService();
        this.emailService = new EmailsService();
        this.userService = new UsersService();
    }

    @Post("/")
    public async addContact(@Body() contact: AddContact, @Res() response: Response) {

        try {
            const newContactData = await this.service.addContact(contact);
            if (newContactData) {
                // const otherPersonContact = contact;
                // otherPersonContact.otherPersonEmail = contact.owner.email;
                // otherPersonContact.owner = new User(await this.userService.getUser(contact.otherPersonEmail));
                // await this.service.addContact(otherPersonContact);
                const newContact = new Contact(newContactData);
                if (newContactData instanceof ContactAdapter) {
                    newContact.setOtherPerson(new User(newContactData.get('OtherPerson') as IUser));
                    newContact.status = ContactStatus.ACTIVE;
                } else {
                    newContact.setOtherPerson(new User(undefined));
                    newContact.otherPerson.email = contact.otherPersonEmail;
                    newContact.status = ContactStatus.PENDING;
                }
                response.status(201).json({"status": 1, contact: newContact});
            }
        } catch (error) {
            response.status(400).json({"status": 0, error: (error as Error).message});
        }
        return response;

    }

    @Get("/:userId")
    public async getContactList(@Param("userId") userId: number) {
        const contactsToAdapt = await this.service.getContacts(userId);
        const PendingContactsToAdapt = await this.service.getPendingContacts(userId);
        const contacts = contactsToAdapt.map(contactData => {
            const contact = new Contact(contactData);
            contact.setOtherPerson(new User(contactData.get('OtherPerson') as IUser));
            contact.status = ContactStatus.ACTIVE;
            return contact;
        });
        contacts.push(...PendingContactsToAdapt.map(pendingContact => {
            const contact = new Contact(pendingContact);
            contact.setOtherPerson(new User(undefined));
            contact.otherPerson.email = pendingContact.Contact_User_Email;
            contact.status = ContactStatus.PENDING;
            return contact;
        }))
        return contacts;
    }


    @Get("/suggestions")
    public async getSuggestions() {
        const contactsToAdapt = await this.service.getSuggestions();
        return contactsToAdapt.map(contactData => {
            const contact = new Contact(contactData);
            contact.setOtherPerson(new User(contactData.get('OtherPerson') as IUser));
            return contact;
        });
    }

    @Post("/invite-friend")
    public async inviteFriend(@BodyParam('nickname') nickname: string, @BodyParam('otherPersonEmail') otherPersonEmail: string) {
        this.emailService.sendInviteEmail(nickname, otherPersonEmail);
    }

}

ContactsController.updateSwagger();

export default ContactsController;