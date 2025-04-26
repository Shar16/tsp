const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const gmailAuth = () => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://mail.google.com"],
        // prompt: 'consent'
    });
    return authUrl;
};

const authCallback = async (code) => {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    console.log("Tokens1:", tokens);
    return tokens;
};

const getEmails = async () => {
    const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
    oAuth2Client.setCredentials({
        access_token: process.env.GOOGLE_ACCESS_TOKEN,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
    const response = await gmail.users.messages.list({
        userId: "me",
        maxResults: 10,
    });
    const messages = response.data.messages;

    if (!messages) {
        return "There are no messages";
    }

    const mails = await Promise.all(
        messages.map(async (message) => ({
            id: message.id,
            threadId: message.threadId,
            payload: await getSingleEmail(message.id, gmail),
        }))
    );
    return mails;
};

const getSingleEmail = async (emailId, gmail) => {
    const response = await gmail.users.messages.get({
        id: emailId,
        userId: "me",
    });
    const email = response.data;
    console.log("emailResponse:", email);
    return email;
};

const sendMail = async () => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "softwareteamproject08@gmail.com",
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN, //this is temporary should be read from db later
                accessToken: process.env.GOOGLE_ACCESS_TOKEN, //this is temporary should be read from db later
            },
        });

        const mailOptions = {
            from: "OCTA TEAM <softwareteamproject08@gmail.com>",
            to: "softwareteamproject08@gmail.com",
            subject: "Tes Email With Static Token",
            text: "this is a sent from nodejs.",
            html: "<h1>this is a sent from nodejs.</h1>",
        };
        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.log("error", error);
        return error;
    }
};

exports.gmail = {
    sendMail,
    gmailAuth,
    getEmails,
    authCallback,
};
