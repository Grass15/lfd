import {emailTransporter, noReplyEmailAddress} from "../config/email";
import {Cash, Item, OtherExchangedGood} from "../transactions/models/exchangedGood/ExchangedGood";
import {ExchangedGoodType} from "../transactions/models/exchangedGood/IExchangedGood";
import OtherTransaction from "../transactions/models/OtherTransaction";
import Transaction from "../transactions/models/Transaction"
import * as fs from 'fs';
import * as handlebars from "handlebars";

class EmailsService {
    public sendApprovalEmail(nickname: string, transactionParty: string, transaction: Transaction, email: string) {
        const html = fs.readFileSync('src/utils/ApprovalReceiptEmailTemplate.html', {encoding: 'utf-8'});
        const templateParser = handlebars.compile(html);
        const template = this.fillTransactionTemplate(templateParser, nickname, transactionParty, transaction);
        this.sendEmail(noReplyEmailAddress, email, "Approval Receipt", template);
    }

    public sendInviteEmail(invitor: string, email: string) {
        const html = fs.readFileSync('src/utils/InviteFriendEmailTemplate.html', {encoding: 'utf-8'});
        const templateParser = handlebars.compile(html);
        const template = templateParser({
            'invitor': invitor,
        });
        this.sendEmail(noReplyEmailAddress, email, "You received an Invite", template);
    }

    public sendSettlementEmail(nickname: string, transactionParty: string, transaction: Transaction, email: string) {
        const html = fs.readFileSync('src/utils/SettlementReceiptEmailTemplate.html', {encoding: 'utf-8'});
        const templateParser = handlebars.compile(html);
        const template = this.fillTransactionTemplate(templateParser, nickname, transactionParty, transaction);
        this.sendEmail(noReplyEmailAddress, email, "Settlement Receipt", template);
    }

    public sendVerificationEmail(code: number, email: string, nickname: string) {
        const html = fs.readFileSync('src/utils/verificationEmailTemplate.html', {encoding: 'utf-8'});
        const templateParser = handlebars.compile(html);
        const template = templateParser({
            'nickname': nickname,
            'code': code
        });
        this.sendEmail(noReplyEmailAddress, email, "Lend a Friend Email Verification Code", template);
    }

    private fillTransactionTemplate(templateParser: HandlebarsTemplateDelegate, nickname: string, transactionParty: string, transaction: Transaction) {
        let exchangedGoodValue;
        switch (transaction.exchangedGood.type) {
            case ExchangedGoodType.ITEM:
                exchangedGoodValue = (transaction.exchangedGood as Item).itemName;
                break;
            case ExchangedGoodType.CASH:
                exchangedGoodValue = (transaction.exchangedGood as Cash).amount + (transaction.exchangedGood as Cash).currency;
                break;
            case ExchangedGoodType.OTHER:
                exchangedGoodValue = (transaction.exchangedGood as OtherExchangedGood).topicName;
                break;
        }
        return templateParser({
            'nickname': nickname,
            'friendName': transactionParty,
            'status': transaction.status,
            'type': transaction.exchangedGood.type,
            'exchangedGoodType': transaction.exchangedGood.type,
            'exchangedGoodValue': exchangedGoodValue,
            'initiationDate': transaction.initiationDate?.toLocaleDateString(),
            'targetDate': transaction.target?.toLocaleDateString(),
            'description': transaction.exchangedGood.description,
        });
    }

    private sendEmail(from: string, to: string, subject: string, template: string) {
        const options = {
            from: from,
            to: to,
            subject: subject,
            html: template
        };
        emailTransporter.sendMail(options, (error, info) => {
            if (error) {
                throw new Error(error.message)
            }
        });
    }

}

export default EmailsService;