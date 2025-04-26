const { google } = require("googleapis");
const { CustomError } = require("../utils/CustomError");
const moment = require("moment");
const { formatGmailMessageResponse } = require("../utils/Emails");

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const getLinkedAccount = (email, user) =>
    user.linkedAccounts.find((account) => account.email === email);

const checkCredential = async (email, user) => {
    const emailCredential = getLinkedAccount(email, user);
    const { accessTokenExpiresAt, refreshTokenExpiresAt } = emailCredential;

    const current = Date.now();
    if (refreshTokenExpiresAt < current) {
        // Can't do anything for now if refresh token expired
        // We can only make the user relink the account again
        // Test accounts refresh token lifetime 7 days
        // For production apps, this will never expire unless user deletes the session from google
        throw new CustomError("Expired Refresh Token");
    }

    if (accessTokenExpiresAt < current + 5000) {
        // Do refresh because we know access token is expired (+5s for safety)

        const tokens = {
            access_token: emailCredential.accessToken,
            refresh_token: emailCredential.refreshToken,
        };
        oAuth2Client.setCredentials(tokens);

        // Get new access token only
        const { credentials: newCredentials } =
            await oAuth2Client.refreshAccessToken(); // WARN: Can fail
        emailCredential["accessToken"] = newCredentials.access_token;
        emailCredential["accessTokenExpiresAt"] = newCredentials.expiry_date;
    }

    oAuth2Client.setCredentials({
        access_token: emailCredential.accessToken,
        refresh_token: emailCredential.refreshToken,
    });

    return { oAuth: oAuth2Client, credential: emailCredential };

    // if (!tokens) {
    //     return generateAuthUrl();
    // } else {
    //     oAuth2Client.setCredentials(tokens);
    //     return { oAuth: oAuth2Client, credential: emailCredential };
    // }
};

// Data represents any data we want to be passed (when google calls our server to give us tokens)
// Eg. use case - userId to identity for which user google is providing use tokens for
const generateAuthUrl = (data) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://mail.google.com",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "openid",
        ],
        state: data,
        prompt: "consent",
    });
    return { message: "session_expired_reauth", authUrl: authUrl };
};

const decodeIdToken = async (oAuth2Client, idToken) => {
    const ticket = await oAuth2Client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
};

const getSingleEmail = async (emailId, gmail) => {
    const response = await gmail.users.messages.get({
        id: emailId,
        userId: "me",
    });
    const email = response.data;
    return email;
};

module.exports = ({ UsersService }) => ({
    // AUTH SECTION
    generateAuthUrl,
    getAuthCallBack: async ({ code, state: userId }) => {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        const { email } = await decodeIdToken(oAuth2Client, tokens.id_token);
        const user = await UsersService.getUser({ _id: userId });

        const current = moment();
        const aWeekAfter = current.add(7, "days").valueOf();

        const linkedAccounts = user.linkedAccounts;
        const accountIndex = linkedAccounts.findIndex(
            (account) => account.email === email
        );
        let newAccount = false;
        if (accountIndex === -1) {
            newAccount = true;
            linkedAccounts.push({
                service: "GMAIL",
                email: email,
                accessToken: tokens.access_token,
                accessTokenExpiresAt: tokens.expiry_date,
                refreshToken: tokens.refresh_token,
                refreshTokenExpiresAt: aWeekAfter,
            });
        } else {
            linkedAccounts[accountIndex].accessToken = tokens.access_token;
            linkedAccounts[accountIndex].refreshToken = tokens.refresh_token;
            linkedAccounts[accountIndex].accessTokenExpiresAt =
                tokens.expiry_date;
            linkedAccounts[accountIndex].refreshTokenExpiresAt = aWeekAfter;
        }
        await UsersService.addLinkedAccount({
            newAccount,
            userId,
            linkedAccount: linkedAccounts,
        });
        return { success: true }; // We will be redirecting anyway
    },
    // END OF AUTH SECTION

    // EMAIL SECTION
    getEmails: async ({ email, limit, skip, labelIds }, userId) => {
        const user = await UsersService.getUser({ _id: userId });
        const linkedAccount = getLinkedAccount(email, user);
        if (!linkedAccount) throw new CustomError("Account not linked");

        const auth = await checkCredential(email, user);
        const gmail = google.gmail({ version: "v1", auth: auth.oAuth });

        let gmailQuery = {};
        if (labelIds) {
            gmailQuery = {
                userId: "me",
                labelIds: labelIds,
                maxResults: limit,
            };
        } else {
            gmailQuery = {
                userId: "me",
                maxResults: limit,
            };
        }

        const response = await gmail.users.messages.list(gmailQuery);
        const messages = response.data.messages;

        if (!messages) {
            return { data: [] };
        }

        const mails = await Promise.all(
            messages.map(async (message) => ({
                id: message.id,
                threadId: message.threadId,
                payload: await getSingleEmail(message.id, gmail),
            }))
        );
        response.data.messages = mails;

        return {
            data: mails.map(formatGmailMessageResponse),
            nextPageToken: response.data.nextPageToken,
            originalResponse: response, // TODO: Should delete, included for the sake of testing
        };
    },
    getEmailAttachement: async (value, userId) => {
        const user = await UsersService.getUser({ _id: userId });
        const linkedAccount = getLinkedAccount(value.email, user);
        if (!linkedAccount) throw new CustomError("Account not linked");

        const auth = await checkCredential(value.email, user);
        const gmail = google.gmail({ version: "v1", auth: auth.oAuth });
        const response = await gmail.users.messages.attachments.get({
            id: value.attachmentId,
            messageId: value.emailId,
            userId: "me",
        });
        const attachment = response.data;
        return { file: attachment.data, filename: value.fileName };
    },
    sendEmail: async (values, userId) => {
        const user = await UsersService.getUser({ _id: userId });
        const auth = await checkCredential(values.email, user);
        const gmail = google.gmail({ version: "v1", auth: auth.oAuth });
        const message = values.message;
        const raw = Buffer.from(
            "From: " +
                auth.credential.email +
                "\r\n" +
                "To: " +
                values.to +
                "\r\n" +
                "Subject: " +
                values.subject +
                "\r\n\r\n" +
                message
        )
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
        const response = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: raw,
            },
        });
        return { success: true, threadId: response.data.threadId };
    },
    updateLabels: async (value, userId) => {
        const user = await UsersService.getUser({ _id: userId });
        const auth = await checkCredential(value.email, user);
        const gmail = google.gmail({ version: "v1", auth: auth.oAuth });
        const response = await gmail.users.messages.modify({
            userId: "me",
            id: value.threadId,
            requestBody: {
                addLabelIds: value.addLabelIds,
                removeLabelIds: value.removeLabelIds,
            },
        });
        return {
            success: true,
            threadId: response.data.threadId,
            labelIds: response.data.labelIds,
        };
    },
    // END OF EMAIL SECTION
});
