import IExchangedGood, {ExchangedGoodType} from "./IExchangedGood";

export class ExchangedGood {
    public description!: string;
    public transactionId: number;
    public type!: ExchangedGoodType;

    constructor(description: string, type: ExchangedGoodType, transactionId: number) {
        this.description = description;
        this.type = type;
        this.transactionId = transactionId;
    }
}

export class Cash extends ExchangedGood {
    public amount: number;
    public currency: string;

    constructor(exchangedGood: IExchangedGood) {
        super(exchangedGood.description, exchangedGood.type, exchangedGood.transactionId);
        this.amount = exchangedGood.amount as number;
        this.currency = exchangedGood.currency as string;
    }
}


export class Item extends ExchangedGood {
    public image?: string;
    public itemName: string;

    constructor(exchangedGood: IExchangedGood) {
        super(exchangedGood.description, exchangedGood.type, exchangedGood.transactionId);
        this.itemName = exchangedGood.itemName as string;
        this.image = exchangedGood.image;
    }
}

export class OtherExchangedGood extends ExchangedGood {
    public image?: string;
    public topicName: string;

    constructor(exchangedGood: IExchangedGood) {
        super(exchangedGood.description, exchangedGood.type, exchangedGood.transactionId);
        this.topicName = exchangedGood.topicName as string;
        this.image = exchangedGood.image;
    }
}