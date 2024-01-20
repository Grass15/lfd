export abstract class Notification {
    public description: string;
    public type: NOTIFICATION_TYPE;

    protected constructor(description: string, type: NOTIFICATION_TYPE) {
        this.description = description;
        this.type = type;
    }
}

export class TransactionNotification extends Notification {
    transactionId: number;

    constructor(transactionId: number, description: string, type: NOTIFICATION_TYPE) {
        super(description, type);
        this.transactionId = transactionId;
    }
}

export class ContactNotification extends Notification {
    contactId: number;

    constructor(contactId: number, description: string, type: NOTIFICATION_TYPE) {
        super(description, type);
        this.contactId = contactId;
    }
}

export enum NOTIFICATION_TYPE {
    INITIATION_REQUEST = "initiation_request",
    SETTLEMENT_REQUEST = "settlement_request",
    TRANSACTION_APPROVED = "transaction_approved",
    TRANSACTION_REFUSED = "transaction_refused",
    TRANSACTION_REMINDER = "transaction_reminder",
}