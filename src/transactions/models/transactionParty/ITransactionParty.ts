interface ITransactionParty {
    ratingText?: string;
    ratingValue?: number;
    role: string;
    transactionId: number;
    transactionPartyId: number;
    userId: number;
    approved: boolean;
}

export default ITransactionParty;