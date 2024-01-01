import {Body, BodyParam, Get, JsonController, Param, Post, Res} from "routing-controllers";
import {ResponseSchema} from "routing-controllers-openapi";
import IUser from "../users/models/IUser";
import User from "../users/models/User";
import UsersService from "../users/UsersService";
import BaseController from "../utils/BaseController";
import ContactsService from "./ContactsService";
import Contact, {AddContact} from "./models/Contact";
import {Response} from "express";
import EmailsService from "../emails/EmailsService";

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
        console.log(contact)
        try {
            const newContactData = await this.service.addContact(contact);
            if (newContactData) {
                // const otherPersonContact = contact;
                // otherPersonContact.otherPersonEmail = contact.owner.email;
                // otherPersonContact.owner = new User(await this.userService.getUser(contact.otherPersonEmail));
                // await this.service.addContact(otherPersonContact);
                const newContact = new Contact(newContactData);
                newContact.setOtherPerson(new User(newContactData.get('OtherPerson') as IUser));
                response.status(201).json({"status": 1, contact: newContact});
            } else {
                response.status(200).json({"status": 1, message: "Invite Email Sent Successfully"});
            }
        } catch (error) {
            response.status(400).json({"status": 0, error: error});
        }
        return response;

    }

    @Get("/:userId")
    public async getContactList(@Param("userId") userId: number) {
        const contactsToAdapt = await this.service.getContacts(userId);
        return contactsToAdapt.map(contactData => {
            const contact = new Contact(contactData);
            contact.setOtherPerson(new User(contactData.get('OtherPerson') as IUser));
            return contact;
        });
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