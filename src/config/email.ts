import nodemailer from 'nodemailer';

export const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: 'lunarmoonservice@gmail.com',
        pass: 'iptz blty sxta pitx',
    },
    secure: false,
});
 
export const noReplyEmailAddress = '<noreply@lendafriend.com>'