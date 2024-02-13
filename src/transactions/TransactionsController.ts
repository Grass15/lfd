import {Response} from "express";
import multer from "multer";
import {Body, BodyParam, Get, JsonController, Param, Patch, Post, Put, Res, UploadedFile} from 'routing-controllers';
import {upload} from "../config/multerConfig";
import ContactsService from "../contacts/ContactsService";
import EmailsService from "../emails/EmailsService";
import {NOTIFICATION_TYPE, TransactionNotification} from "../sockets/Notification";
import {sendNotification} from "../sockets/socketIOHandler";
import IUser from "../users/models/IUser";
import User from "../users/models/User";
import UsersService from "../users/UsersService";
import BaseController from "../utils/BaseController";
import {Cash, ExchangedGood, Item, OtherExchangedGood} from "./models/exchangedGood/ExchangedGood";
import ExchangedGoodAdapter from "./models/exchangedGood/ExchangedGoodAdapter";
import {ExchangedGoodType} from "./models/exchangedGood/IExchangedGood";
import Loan from "./models/Loan";
import OtherTransaction from "./models/OtherTransaction";
import pendingTransactionAdapter from "./models/PendingTransactionAdapter";
import PendingTransactionAdapter from "./models/PendingTransactionAdapter";
import Transaction, {TransactionPartyRoles, TransactionStatus, TransactionType} from "./models/Transaction"
import TransactionAdapter from "./models/TransactionAdapter";
import PendingTransactionPartyAdapter from "./models/transactionParty/PendingTransactionPartyAdapter";
import TransactionParty from "./models/transactionParty/TransactionParty";
import TransactionPartyAdapter from "./models/transactionParty/TransactionPartyAdapter";
import TransactionsService from "./TransactionsService";

@JsonController("/api/transactions")
class TransactionsController extends BaseController {
    contactsService: ContactsService
    emailsService: EmailsService;
    service: TransactionsService;
    usersService: UsersService;

    constructor() {
        super();
        this.service = new TransactionsService();
        this.contactsService = new ContactsService();
        this.emailsService = new EmailsService();
        this.usersService = new UsersService();
    }

    @Put("/approve-transaction/:transactionId")
    public async approveTransaction(@BodyParam("approvalDate") approvalDate: Date, @BodyParam("userId") userId: number, @Param('transactionId') transactionId: number) {
        // Add logic to check if user has right to do this
        await this.service.approveTransaction(approvalDate, transactionId);
        const transaction: Transaction = await this.getTransactionById(transactionId);
        // const approverNameInReceiverContact = await this.contactsService.getContactDescription(transaction.initiator.id, userId);
        // this.sendTransactionNotification(
        //     transaction.id as number,
        //     userId,
        //     `${approverNameInReceiverContact} approved your transaction request`,
        //     NOTIFICATION_TYPE.INITIATION_REQUEST
        // );
        // switch (transaction.type){
        //     case "cash":
        // }
        //
        // const approver: User = userId == transaction.lender.id ? transaction.lender : transaction.borrower;
        // const initiator: User = userId == transaction.lender.id ? transaction.borrower : transaction.lender;
        // const approvalReceiptParams: ApprovalReceiptParams = {
        //     description: transaction.exchangedGood.description,
        //     email: approver.email,
        //     nickname: approver.nickname,
        //     friendName: initiator.nickname,
        //     transactionId: transactionId,
        //     transactionType: transaction.type,
        //
        // };
        return transaction;
    }
    @Put("/approve-witness-transaction/:transactionId")
    public async approveWitnessTransaction(@BodyParam("approvalDate") approvalDate: Date, @BodyParam("userId") userId: number, @Param('transactionId') transactionId: number) {
        // Add logic to check if user has right to do this
        console.log("userId: ",userId,"  transaction Id:",transactionId)
        await this.service.approveWitnessTransaction(approvalDate, userId,transactionId);
        const transaction: Transaction = await this.getTransactionById(transactionId);
        return transaction;
    }
    // @Get("/borrower/:transactionId")
    // public async getTransactionBorrower(@Param('transactionId') transactionId: number) {
    //     const transaction = await this.service.getTransactionBorrower(transactionId);
    //     let borrower: Borrower;
    //     if (transaction && transaction.get('Borrower')) {
    //         borrower = new Borrower(transaction.get('Borrower') as IUser, transaction.Transaction_Rating_Borrower, transaction.Transaction_Rating_Borrower_Message)
    //         return borrower;
    //     } else return null;
    // }

    @Patch("/change-transaction/:userId")
    public async changeTransaction(@Body() transaction: any, @Param('userId') userId: number) {
        await this.service.changeTransactionDetails(transaction);
        return await this.getTransactionById(transaction.id as number, userId);
    }

    @Patch("/confirm-settlement/:transactionId")
    public async confirmSettlement(@BodyParam("userId") userId: number, @Param('transactionId') transactionId: number) {
        // Add logic to check if user has right to do this
        await this.service.updateTransactionStatus(transactionId, TransactionStatus.SETTLED);
        const transaction: Transaction = await this.getTransactionById(transactionId, userId);
        // const settlerNameInContact = await this.contactsService.getContactDescription(transaction.lender.id, userId);
        // this.sendTransactionNotification(
        //     transactionId,
        //     transaction.initiator.id,
        //     `${settlerNameInContact} settled your transaction`,
        //     NOTIFICATION_TYPE.TRANSACTION_REFUSED
        // );
        return transaction;
    }

    @Get("/:userId")
    public async getTransactions(@Param('userId') userId: number) {
        const transactions: Transaction[] = [];
        const transactionsData = await this.service.getUserTransactions(userId);
        const user = await this.usersService.getById(userId) as IUser;
        const pendingTransactionsData = await this.service.getUserPendingTransactions(user.Email);
        const adaptedTransactions = await Promise.all(
            transactionsData.map(async (transactionData) => {
                const transactionParties = await this.service.getTransactionParties(transactionData.transactionId);
                const exchangedGood = await this.service.getTransactionExchangedGood(transactionData.transactionId) as ExchangedGoodAdapter;
                return await this.adaptTransaction(transactionData, transactionParties, exchangedGood, userId);
            })
        );
        const adaptedPendingTransactions = await Promise.all(
            pendingTransactionsData.map(async (transactionData) => {
                return await this.getPendingTransactionById(transactionData, userId);
            })
        );
        transactions.push(...adaptedTransactions);
        transactions.push(...adaptedPendingTransactions);
        return transactions;
    }

    @Post("/initiate-transaction")
    public async initiateTransaction(@Body() transaction: any) {
        const newTransactionData = await this.service.initiateTransaction(transaction);
        let newTransaction;
        if (newTransactionData instanceof TransactionAdapter) {
            newTransaction = await this.getTransactionById(newTransactionData.transactionId);
        } else {
            newTransaction = await this.getPendingTransactionById(newTransactionData);
        }
        // const receiver = this.getTransactionRequestReceiver(newTransaction);
        // const initiatorNameInContact = await this.contactsService.getContactDescription(receiver.id, transaction.initiator.id);
        // this.sendTransactionNotification(
        //     newTransaction.id as number,
        //     newTransaction.initiator.id,
        //     `${initiatorNameInContact} sent you transaction request`,
        //     NOTIFICATION_TYPE.INITIATION_REQUEST
        // );
        return newTransaction;
    }

    @Patch("/rate-transaction/:userId")
    public async rateTransaction(@Body() transaction: any, @Param('userId') userId: number) {
        await this.service.rateTransactionParty(transaction, userId);
        return transaction;
    }

    @Patch("/refuse-transaction/:transactionId")
    public async refuseTransaction(@BodyParam("userId") userId: number, @Param('transactionId') transactionId: number) {
        // Add logic to check if user has right to do this
        await this.service.refuseTransaction(transactionId);
        const transaction: Transaction = await this.getTransactionById(transactionId, userId);
        // const refuserNameInContact = await this.contactsService.getContactDescription(transaction.initiator.id, userId);
        // this.sendTransactionNotification(
        //     transactionId,
        //     transaction.initiator.id,
        //     `${refuserNameInContact} refused your transaction request`,
        //     NOTIFICATION_TYPE.TRANSACTION_REFUSED
        // );
        return transaction;
    }

    @Patch("/reject-settlement/:transactionId")
    public async rejectSettlement(@BodyParam("userId") userId: number, @Param('transactionId') transactionId: number) {
        // Add logic to check if user has right to do this
        await this.service.updateTransactionStatus(transactionId, TransactionStatus.PROCESSING);
        const transaction: Transaction = await this.getTransactionById(transactionId, userId);
        // const settlerNameInContact = await this.contactsService.getContactDescription(transaction.lender.id, userId);
        // this.sendTransactionNotification(
        //     transactionId,
        //     transaction.initiator.id,
        //     `${settlerNameInContact} settled your transaction`,
        //     NOTIFICATION_TYPE.TRANSACTION_REFUSED
        // );
        return transaction;
    }

    @Get("/request-settlement/:transactionId/:userId")
    public async requestSettlement(@Param('transactionId') transactionId: number, @Param('userId') userId: number, @Res() response: Response) {
        try {
            const transaction = await this.getTransactionById(transactionId, userId);
            let transactionParty: string;
            switch (transaction.type) {
                case TransactionType.LOAN:
                    const loan = transaction as Loan;
                    transactionParty = await this.contactsService.getContactDescription(loan.borrower.user.id, loan.lender.user.id);
                    this.emailsService.requestSettlement(transactionParty || loan.lender.user.email, loan, loan.borrower.user.email);
                    break;
                case TransactionType.OTHER:
                    const otherTransaction = transaction as OtherTransaction;
                    transactionParty = await this.contactsService.getContactDescription(otherTransaction.receiver.user.id, otherTransaction.sender.user.id);
                    this.emailsService.requestSettlement(transactionParty || otherTransaction.sender.user.email, otherTransaction, otherTransaction.receiver.user.email);
                    break;
            }
            return response.status(201).json({"status": 1, message: 'Settlement request sent successfully'});
        } catch (error) {
            return response.status(400).json({"status": 0, error: error});
        }
    }

    @Put("/settle-transaction/:transactionId")
    public async settleTransaction(@BodyParam("settlementDate") settlementDate: Date, @BodyParam("userId") userId: number, @BodyParam("receipt") receipt: string, @Param('transactionId') transactionId: number) {
        // Add logic to check if user has right to do this
        await this.service.settleTransaction(settlementDate, transactionId, receipt);
        const transaction: Transaction = await this.getTransactionById(transactionId, userId);
        // const settlerNameInContact = await this.contactsService.getContactDescription(transaction.lender.id, userId);
        // this.sendTransactionNotification(
        //     transactionId,
        //     transaction.initiator.id,
        //     `${settlerNameInContact} settled your transaction`,
        //     NOTIFICATION_TYPE.TRANSACTION_REFUSED
        // );
        return transaction;
    }

    @Post("/upload-image")
    public async uploadImage(@UploadedFile('image', {options: upload}) image: Express.Multer.File) {
        return image.filename;
    }

    private async getTransactionById(transactionId: number, userId?: number) {
        const transactionData = await this.service.getTransactionById(transactionId) as TransactionAdapter;
        const transactionParties = await this.service.getTransactionParties(transactionId);
        // console.log("transactionData:",transactionData)
        console.log("transactionParties*********************************:",transactionParties)
        const exchangedGood = await this.service.getTransactionExchangedGood(transactionId) as ExchangedGoodAdapter;
        return this.adaptTransaction(transactionData, transactionParties, exchangedGood, userId)
    }

    private async getPendingTransactionById(pendingTransactionData: PendingTransactionAdapter, userId?: number) {
        pendingTransactionData = await this.service.getPendingTransactionById(pendingTransactionData.id) as PendingTransactionAdapter;
        const pendingTransactionPartiesData = await pendingTransactionData.get('pendingTransactionParties');
        const exchangedGood = await pendingTransactionData.get('exchangedGood');
        const pendingTransactionParties = await this.adaptTransactionParties(pendingTransactionPartiesData as TransactionPartyAdapter[])
        pendingTransactionParties.forEach(trxParty => {
            trxParty.user = new User(undefined);
            trxParty.user.email = (pendingTransactionPartiesData as PendingTransactionPartyAdapter[]).filter(party => party.id == trxParty.transactionPartyId)[0].email;
        })
        return await this.getTransactionClassObject(
            pendingTransactionParties,
            this.adaptExchangedGood(exchangedGood as ExchangedGoodAdapter),
            pendingTransactionData as any,
            userId
        );
    }

    private adaptExchangedGood(exchangedGoodData: ExchangedGoodAdapter) {
        let exchangedGood;
        switch (exchangedGoodData.type) {
            case ExchangedGoodType.CASH:
                exchangedGood = new Cash(exchangedGoodData);
                break;
            case ExchangedGoodType.ITEM:
                exchangedGood = new Item(exchangedGoodData);
                break;
            case ExchangedGoodType.OTHER:
                exchangedGood = new OtherExchangedGood(exchangedGoodData);
                break;
        }
        return exchangedGood;
    }

    private async adaptTransactionParties(transactionPartiesData: TransactionPartyAdapter[]) {
        return await Promise.all(
            transactionPartiesData.map(async (trxP) => {
                const party = new TransactionParty(trxP);
                const user = await trxP.get('user') as IUser;
                party.user = new User(user);
                return party;
            })
        );
    }

    private async getTransactionClassObject(transactionParties: TransactionParty[], exchangedGood: ExchangedGood, transactionData: TransactionAdapter, userId?: number) {
        let transaction;
        switch (transactionData.type) {
            case TransactionType.LOAN:
                transaction = new Loan(transactionData);
                const borrower = transactionParties.filter(party => party.role.includes(TransactionPartyRoles.BORROWER))[0];
                const lender = transactionParties.filter(party => party.role.includes(TransactionPartyRoles.LENDER))[0];
                const initiator = transactionParties.filter(party => party.role.length > 1 && party.role.includes(TransactionPartyRoles.INITIATOR))[0];
                if (!userId) userId = initiator.user.id;
                if (userId == lender.user.id) {
                    const borrowerNameInLenderContact = borrower.user.id ?
                        await this.contactsService.getContactDescription(lender.user.id, borrower.user.id) :
                        await this.contactsService.getPendingContactDescription(lender.user.id, borrower.user.email);
                    borrower.user.nickname = borrowerNameInLenderContact || borrower.user.email;
                } else {
                    const lenderNameInBorrowerContact = lender.user.id ?
                        await this.contactsService.getContactDescription(borrower.user.id, lender.user.id) :
                        await this.contactsService.getPendingContactDescription(borrower.user.id, lender.user.email);
                    lender.user.nickname = lenderNameInBorrowerContact || lender.user.email;
                }
                transaction.setBorrower(borrower);
                transaction.setLender(lender);
                transaction.setInitiator(initiator);
                break;
            case TransactionType.OTHER:
                transaction = new OtherTransaction(transactionData);
                const sender = transactionParties.filter(party => party.role[0] == TransactionPartyRoles.SENDER)[0];
                const receiver = transactionParties.filter(party => party.role[0] == TransactionPartyRoles.RECEIVER)[0];
                if (!userId) userId = sender.user.id;
                if (userId == receiver.user.id) {
                    const senderNameInReceiverContact = sender.user.id ?
                        await this.contactsService.getContactDescription(receiver.user.id, sender.user.id) :
                        await this.contactsService.getPendingContactDescription(receiver.user.id, sender.user.email);
                    sender.user.nickname = senderNameInReceiverContact || sender.user.email;
                } else {
                    const receiverNameInSenderContact = receiver.user.id ?
                        await this.contactsService.getContactDescription(sender.user.id, receiver.user.id) :
                        await this.contactsService.getPendingContactDescription(sender.user.id, receiver.user.email);
                    receiver.user.nickname = receiverNameInSenderContact || receiver.user.email;
                }
                transaction.setSender(sender);
                transaction.setReceiver(receiver);
                break;
        }
        const witness = transactionParties.filter(party => party.role.includes(TransactionPartyRoles.WITNESS));
        console.log("witness:",witness);
        witness.forEach((user) =>{
            transaction!.setWitness(user)
        })
        transaction.exchangedGood = exchangedGood;
        return transaction;
    }

    private async adaptTransaction(transactionData: TransactionAdapter, transactionPartiesData: TransactionPartyAdapter[], exchangedGoodData: ExchangedGoodAdapter, userId?: number) {
        console.log("transactionPartiesData here 1:",transactionPartiesData)
        const transactionParties = await this.adaptTransactionParties(transactionPartiesData);
        console.log("transactionParties: here 2:",transactionParties)
        const exchangedGood = this.adaptExchangedGood(exchangedGoodData);
        return await this.getTransactionClassObject(transactionParties, exchangedGood, transactionData, userId);
    }

    private sendTransactionNotification(transactionId: number, receiverId: number, description: string, notificationType: NOTIFICATION_TYPE) {
        const notification = new TransactionNotification(
            transactionId,
            description,
            notificationType,
        );
        sendNotification(receiverId, notification);
    }
}

TransactionsController.updateSwagger();

export default TransactionsController;
