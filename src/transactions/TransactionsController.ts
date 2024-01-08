import {Body, BodyParam, Get, JsonController, Param, Patch, Post, Put, Req, UploadedFile} from 'routing-controllers';
import {Error} from "sequelize";
import {upload} from "../config/multerConfig";
import ContactsService from "../contacts/ContactsService";
import {NOTIFICATION_TYPE, TransactionNotification} from "../sockets/Notification";
import {sendNotification} from "../sockets/socketIOHandler";
import Borrower from "../users/models/Borrower";
import IUser from "../users/models/IUser";
import Lender from "../users/models/Lender";
import User from "../users/models/User";
import UsersService from "../users/UsersService";
import BaseController from "../utils/BaseController";
import ITransaction from "./models/ITransaction";
import Transaction, {TransactionInitiationParams} from "./models/Transaction";
import TransactionAdapter from "./models/TransactionAdapter";
import TransactionsService from "./TransactionsService";

@JsonController("/api/transactions")
class TransactionsController extends BaseController {
    contactsService: ContactsService
    service: TransactionsService;

    //usersService: UsersService

    constructor() {
        super();
        this.service = new TransactionsService();
        //this.usersService = new UsersService();
        this.contactsService = new ContactsService();
    }

    @Put("/approve-transaction/:transactionId")
    public async approveTransaction(@BodyParam("approvalDate") approvalDate: Date, @BodyParam("userId") userId: number, @Param('transactionId') transactionId: number) {
        // Add logic to check if user has right to do this
        await this.service.approveTransaction(approvalDate, transactionId);
        const transaction: Transaction = await this.getTransactionById(transactionId, userId);
        const approverNameInContact = await this.contactsService.getContactDescription(transaction.initiator.id, userId);
        this.sendTransactionNotification(
            transaction.id as number,
            userId,
            `${approverNameInContact} approved your transaction request`,
            NOTIFICATION_TYPE.INITIATION_REQUEST
        );
        return transaction;
    }

    @Get("/borrower/:transactionId")
    public async getTransactionBorrower(@Param('transactionId') transactionId: number) {
        const transaction = await this.service.getTransactionBorrower(transactionId);
        let borrower: Borrower;
        if (transaction && transaction.get('Borrower')) {
            borrower = new Borrower(transaction.get('Borrower') as IUser, transaction.Transaction_Rating_Borrower, transaction.Transaction_Rating_Borrower_Message)
            return borrower;
        } else return null;
    }

    @Get("/lender/:transactionId")
    public async getTransactionLender(@Param('transactionId') transactionId: number) {
        const transaction = await this.service.getTransactionLender(transactionId);
        let lender: Lender;
        if (transaction && transaction.get('Lender')) {
            lender = new Lender(transaction.get('Lender') as IUser, transaction.Transaction_Rating_Lender, transaction.Transaction_Rating_Lender_Message)
            return lender;
        } else return null;
    }

    @Get("/:userId")
    public async getTransactions(@Param('userId') userId: number) {
        const transactions: Transaction[] = [];
        const borrowedTransactionsData = await this.service.getBorrowedTransactions(userId);
        const lentTransactionsData = await this.service.getLentTransactions(userId);
        if (borrowedTransactionsData) {
            const adaptedTransactions = await Promise.all(
                borrowedTransactionsData.map(async (transactionData) => await this.adaptTransaction(transactionData, userId))
            );
            transactions.push(...adaptedTransactions);
        }

        if (lentTransactionsData) {
            const adaptedTransactions = await Promise.all(
                lentTransactionsData.map(async (transactionData) => await this.adaptTransaction(transactionData, userId))
            );
            transactions.push(...adaptedTransactions);
        }

        return transactions;
    }

    @Post("/initiate-transaction")
    public async initiateTransaction(@Body() transaction: TransactionInitiationParams) {
        const newTransactionData = await this.service.initiateTransaction(transaction) as TransactionAdapter;
        const newTransaction = await this.getTransactionById(newTransactionData.TransactionID, transaction.initiator.id);
        const receiver = this.getTransactionRequestReceiver(newTransaction);
        const initiatorNameInContact = await this.contactsService.getContactDescription(receiver.id, transaction.initiator.id);
        this.sendTransactionNotification(
            newTransaction.id as number,
            newTransaction.initiator.id,
            `${initiatorNameInContact} sent you transaction request`,
            NOTIFICATION_TYPE.INITIATION_REQUEST
        );
        return newTransaction;
    }

    @Patch("/rate-transaction/:userId")
    public async rateTransaction(@Body() transaction: Transaction, @Param('userId') userId: number) {
        await this.service.rateTransaction(transaction, userId);
        return transaction;
    }

    @Patch("/refuse-transaction/:transactionId")
    public async refuseTransaction(@BodyParam("userId") userId: number, @Param('transactionId') transactionId: number) {
        // Add logic to check if user has right to do this
        await this.service.refuseTransaction(transactionId);
        const transaction: Transaction = await this.getTransactionById(transactionId, userId);
        const refuserNameInContact = await this.contactsService.getContactDescription(transaction.initiator.id, userId);
        this.sendTransactionNotification(
            transactionId,
            transaction.initiator.id,
            `${refuserNameInContact} refused your transaction request`,
            NOTIFICATION_TYPE.TRANSACTION_REFUSED
        );
        return transaction;
    }

    @Put("/settle-transaction/:transactionId")
    public async settleTransaction(@BodyParam("settlementDate") settlementDate: Date, @BodyParam("userId") userId: number, @BodyParam("receipt") receipt: string, @Param('transactionId') transactionId: number) {
        // Add logic to check if user has right to do this
        await this.service.settleTransaction(settlementDate, transactionId, receipt);
        const transaction: Transaction = await this.getTransactionById(transactionId, userId);
        const settlerNameInContact = await this.contactsService.getContactDescription(transaction.lender.id, userId);
        this.sendTransactionNotification(
            transactionId,
            transaction.initiator.id,
            `${settlerNameInContact} settled your transaction`,
            NOTIFICATION_TYPE.TRANSACTION_REFUSED
        );
        return transaction;
    }

    @Post("/upload-image")
    public async uploadImage(@UploadedFile('image', {options: upload}) image: Express.Multer.File) {
        console.log('Uploaded file:', image);
        console.log('File uploaded successfully');
        return image.filename;
    }

    private async getTransactionById(transactionId: number, userId: number) {
        const transactionData = await this.service.getTransactionById(transactionId);
        return this.adaptTransaction(transactionData, userId)
    }

    private async adaptTransaction(transactionData: TransactionAdapter | null, userId: number) {
        const transaction: Transaction = new Transaction(transactionData as ITransaction);
        if (transactionData) {
            transaction.setBorrower(new Borrower(transactionData.get('Borrower') as IUser, transactionData.Transaction_Rating_Borrower, transactionData.Transaction_Rating_Borrower_Message));
            transaction.setLender(new Borrower(transactionData.get('Lender') as IUser, transactionData.Transaction_Rating_Lender, transactionData.Transaction_Rating_Lender_Message));
            transaction.setInitiator(new User(transactionData.get('Initiator') as IUser));
        }
        switch (userId) {
            case transaction.lender.id:
                const borrowerNameInLenderContact = await this.contactsService.getContactDescription(transaction.lender.id, transaction.borrower.id);
                transaction.borrower.nickname = borrowerNameInLenderContact || transaction.borrower.email;
                if (userId != transaction.initiator.id) {
                    const initiatorNameInReceiverContact = await this.contactsService.getContactDescription(transaction.borrower.id, transaction.lender.id);
                    transaction.initiator.nickname = initiatorNameInReceiverContact || transaction.lender.email;
                }
                break;
            case  transaction.borrower.id:
                const lenderNameInBorrowerContact = await this.contactsService.getContactDescription(transaction.borrower.id, transaction.lender.id);
                transaction.lender.nickname = lenderNameInBorrowerContact || transaction.lender.email;
                if (userId != transaction.initiator.id) {
                    const initiatorNameInReceiverContact = await this.contactsService.getContactDescription(transaction.lender.id, transaction.borrower.id);
                    transaction.initiator.nickname = initiatorNameInReceiverContact || transaction.borrower.email;
                }
                break;
        }
        return transaction;
    }

    private sendTransactionNotification(transactionId: number, receiverId: number, description: string, notificationType: NOTIFICATION_TYPE) {
        const notification = new TransactionNotification(
            transactionId,
            description,
            notificationType,
        );
        sendNotification(receiverId, notification);
    }

    private getTransactionRequester(transaction: Transaction) {
        if (transaction.initiator.id == transaction.borrower.id) {
            return transaction.borrower;
        } else {
            return transaction.lender;
        }
    }

    private getTransactionRequestReceiver(transaction: Transaction) {
        if (transaction.initiator.id != transaction.borrower.id) {
            return transaction.borrower;
        } else {
            return transaction.lender;
        }
    }

}

TransactionsController.updateSwagger();

export default TransactionsController;
