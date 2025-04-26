const { PublicClientApplication } = require("@azure/msal-node");
const axios = require("axios");
const querystring = require("querystring");
const { Client } = require("@microsoft/microsoft-graph-client");

const config = {
    auth: {
        clientId: process.env.OUTLOOK_CLIENT_ID,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
        redirectUri: process.env.OUTLOOK_REDIRECT_URI,
    },
};

const cca = new PublicClientApplication(config);

const checkCredential = async (UsersService, userId, value) => {
    const user = await UsersService.getUser({ _id: userId });
    const emailCredential = user.linkedAccounts.find(
        (account) => account._id.toString() === value.state
    );
    if (!emailCredential || !emailCredential.accessToken) {
        return generateAuthUrl();
    }

    try {
        const token = await checkAndRefreshToken(
            UsersService,
            emailCredential,
            userId
        );
        return { token, credential: emailCredential };
    } catch (error) {
        console.error("Credential check failed:", error);
        return generateAuthUrl();
    }
};

const generateAuthUrl = async () => {
    const authUrl = await cca.getAuthCodeUrl({
        scopes: ["Mail.Read", "Mail.Send", "User.Read"],
        redirectUri: config.auth.redirectUri,
    });
    return { message: "session_expired_reauth", authUrl };
};

const postTokenRequest = async (url, params) => {
    try {
        const response = await axios.post(url, querystring.stringify(params), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        return response.data;
    } catch (error) {
        console.error(
            "Token request failed:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
};

const getAccessToken = async (
    tenantId,
    clientId,
    clientSecret,
    code,
    redirectUri
) => {
    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const params = {
        client_id: clientId,
        scope: "Mail.Read Mail.Send User.Read",
        code: code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        client_secret: clientSecret,
    };

    return postTokenRequest(url, params);
};

const checkAndRefreshToken = async (UsersService, emailCredential, userId) => {
    const now = Date.now();
    if (!emailCredential.expiresAt || now >= emailCredential.expiresAt) {
        try {
            const tokenData = await refreshAccessToken(
                emailCredential.refreshToken
            );

            // Update the credentials in the database
            const expiresAt = Date.now() + tokenData.expires_in * 1000;
            await UsersService.updateEmailCredentials(
                userId,
                emailCredential._id,
                {
                    accessToken: tokenData.access_token,
                    refreshToken:
                        tokenData.refresh_token || emailCredential.refreshToken, // Keep old refresh token if new one isn't provided
                    expiresAt: expiresAt,
                }
            );

            return tokenData.access_token;
        } catch (error) {
            console.error("Token refresh failed:", error);
            throw new Error("Token refresh failed");
        }
    }
    return emailCredential.accessToken;
};

const refreshAccessToken = async (refreshToken) => {
    const url = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;
    const params = {
        client_id: config.auth.clientId,
        scope: "Mail.Read Mail.Send User.Read",
        refresh_token: refreshToken,
        grant_type: "refresh_token",
        client_secret: config.auth.clientSecret,
    };

    return postTokenRequest(url, params);
};

function mapOutlookEmailsToCustomSchema(outlookEmails) {
    return outlookEmails.map((email, index) => {
        return {
            _id: (index + 1).toString(),
            senderName: email.sender.emailAddress.name,
            senderAddress: email.sender.emailAddress.address,
            title: email.subject,
            body: email.body.content,
            attachments: email.hasAttachments ? [] : [],
            timestamp: email.receivedDateTime,
        };
    });
}

module.exports = ({ UsersService }) => ({
    // AUTH SECTION
    generateAuthUrl: async (userId) => {
        const authUrl = await cca.getAuthCodeUrl({
            scopes: ["Mail.Read", "Mail.Send", "User.Read"],
            redirectUri: config.auth.redirectUri,
            state: userId,
        });
        return { message: "Authorization URL generated.", authUrl };
    },

    getAuthCallBack: async (code, originalUrl) => {
        const urlParams = new URLSearchParams(originalUrl);
        const userId = urlParams.get("state");

        const tokenResponse = await getAccessToken(
            "common",
            config.auth.clientId,
            config.auth.clientSecret,
            code,
            config.auth.redirectUri
        );

        const client = Client.init({
            authProvider: (done) => {
                done(null, tokenResponse.access_token);
            },
        });

        const outlookUserData = await client.api("/me").get();
        const user = await UsersService.getUser({ _id: userId });
        const linkedAccounts = user.linkedAccounts;
        const accountIndex = linkedAccounts.findIndex(
            (account) => account.email === outlookUserData.mail
        );
        const expiresAt = Date.now() + tokenResponse.expires_in * 1000;

        let newAccount = false;
        if (accountIndex === -1) {
            newAccount = true;
            linkedAccounts.push({
                provider: "OUTLOOK",
                email: outlookUserData.mail,
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token,
                expiresAt: expiresAt,
            });
        } else {
            linkedAccounts[accountIndex].accessToken =
                tokenResponse.access_token;
            linkedAccounts[accountIndex].refreshToken =
                tokenResponse.refresh_token;
            linkedAccounts[accountIndex].expiresAt = expiresAt;
        }

        await UsersService.addLinkedAccount({
            newAccount,
            userId,
            linkedAccount: linkedAccounts,
        });
        return { tokens: tokenResponse, outlookUserData };
    },

    // EMAIL SECTION
    getEmails: async (value, userId) => {
        const auth = await checkCredential(UsersService, userId, value);
        const client = Client.init({
            authProvider: (done) => {
                done(null, auth.token);
            },
        });

        try {
            const response = await client
                .api("/me/messages")
                .header("Prefer", 'outlook.body-content-type="text"')
                .top(value.limit)
                .get();

            if (!response.value) {
                return { message: "There are no messages" };
            }

            const emails = mapOutlookEmailsToCustomSchema(
                response.value.filter((mail) => mail.subject != "")
            );

            return { data: { messages: emails } };
        } catch (error) {
            console.error("Error fetching emails:", error);
            throw error;
        }
    },

    sendEmail: async (values, userId) => {
        const auth = await checkCredential(UsersService, userId, values);
        const client = Client.init({
            authProvider: (done) => {
                done(null, auth.token);
            },
        });

        const email = {
            message: {
                subject: values.subject,
                body: {
                    contentType: "Text",
                    content: values.text,
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: values.to,
                        },
                    },
                ],
            },
        };

        try {
            const response = await client.api("/me/sendMail").post(email);
            return response;
        } catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    },
});
