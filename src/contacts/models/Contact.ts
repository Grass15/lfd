import User from "../../users/models/User";
import IContact from "./IContact";

class Contact {
    createdAt!: Date;
    description!: string;
    readonly id?: number;
    otherPerson!: User;
    owner!: User;

    constructor(contact: IContact) {
        this.description = contact?.Contact_Description;
        this.id = contact?.ContactID;
        this.createdAt = contact?.Creation_Date;
    }

    public setOtherPerson(otherPerson: User) {
        this.otherPerson = otherPerson;
        this.otherPerson.nickname = this.description;
    }

    public setOwner(owner: User) {
        this.owner = owner;
    }

}

export default Contact;

export type AddContact = {
    createdAt: Date;
    description: string;
    otherPersonEmail: string;
    owner: User;
}