import {emailTransporter, noReplyEmailAddress} from "../config/email";
import * as fs from 'fs';
import * as handlebars from "handlebars";
import {ApprovalReceiptParams} from "../transactions/models/Transaction";

class EmailsService {
    public sendInviteEmail(invitor: string, email: string) {
        const html = fs.readFileSync('src/utils/InviteFriendEmailTemplate.html', {encoding: 'utf-8'});
        const templateParser = handlebars.compile(html);
        const template = templateParser({
            'invitor': invitor,
        });
        this.sendEmail(noReplyEmailAddress, email, "You received an Invite", template);
    }

    public sendTransactionApprovalReceipt(approvalReceiptParams: ApprovalReceiptParams) {
        const html = fs.readFileSync('src/utils/ApprovalReceiptEmailTemplate.html', {encoding: 'utf-8'});
        const templateParser = handlebars.compile(html);
        const template = templateParser({
            'nickname': approvalReceiptParams.nickname,
            'friendName': approvalReceiptParams.friendName,
            'transactionId': approvalReceiptParams.transactionId,
            'type': approvalReceiptParams.transactionType,
            'value': approvalReceiptParams.transactionValue,
            'description': approvalReceiptParams.description,

        });
        this.sendEmail(noReplyEmailAddress, approvalReceiptParams.email, "LenDaFriend Email Approval Receipt", template);
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