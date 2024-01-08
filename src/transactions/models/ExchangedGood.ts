export class ExchangedGood {
    public description!: string;

    constructor(description: string) {
        this.description = description;
    }
}

export class Cash extends ExchangedGood {
    public amount: number;
    public currency?: string;

    constructor(description: string, amount: number, currency: string | undefined) {
        super(description);
        this.amount = amount;
        this.currency = currency;
    }
}


export class Item extends ExchangedGood {
    public designation: string;
    public image?: string;

    constructor(description: string, designation: string, image: string | undefined) {
        super(description);
        this.designation = designation;
        this.image = image;
    }
}

export class Other extends ExchangedGood {
    public image?: string;
    public topic: string;

    constructor(description: string, topic: string) {
        super(description);
        this.topic = topic;
        // this.image = image;
    }
}