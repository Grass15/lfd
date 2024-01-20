interface IExchangedGood {
    amount?: number;
    currency?: string;
    description: string;
    exchangeGoodId: number;
    image?: string;
    itemName?: string;
    topicName?: string;
    transactionId: number;
    type: ExchangedGoodType;
}

export enum ExchangedGoodType {
    CASH = 'cash',
    ITEM = "item",
    OTHER = "other"
}


export default IExchangedGood;