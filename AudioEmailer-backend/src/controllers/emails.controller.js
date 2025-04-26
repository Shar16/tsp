const {
    getEmailsReqSchema,
    sendEmailReqSchema,
    updateLabelsReqSchema,
    getEmailAttachementReqSchema,
    getAuthUrlReqSchema,
} = require("../request-schemas/emails.request-schema");

module.exports = ({ EmailsService, GmailService, OutlookService }) => ({
    getEmails: async (req, res, next) => {
        const { error, value } = getEmailsReqSchema.validate(req.query);
        if (error) return next(error);

        try {
            if (value.accountType === "GMAIL") {
                const response = await GmailService.getEmails(
                    value,
                    req.user._id
                );
                return res.status(200).send(response);
            } else if (value.accountType === "OUTLOOK") {
                const response = await OutlookService.getEmails(
                    value,
                    req.user._id
                );
                return res.status(200).send(response);
            } else {
                const response = await EmailsService.getDummyEmails(value);
                return res.status(200).send(response);
            }
        } catch (error) {
            return next(error);
        }
    },
    getEmailAttachement: async (req, res, next) => {
        const { error, value } = getEmailAttachementReqSchema.validate(
            req.query
        );
        if (error) return next(error);
        try {
            const response = await GmailService.getEmailAttachement(
                value,
                req.user._id
            );
            const buffer = Buffer.from(response.file, "base64");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${response.filename}"`
            );
            if (req.query.contentType)
                res.setHeader("Content-Type", req.query.contentType);
            return res.status(200).send(buffer);
        } catch (error) {
            return next(error);
        }
    },
    sendEmail: async (req, res, next) => {
        const { error, value } = sendEmailReqSchema.validate(req.body);
        if (error) return next(error);
        try {
            if (value.accountType === "GMAIL") {
                const response = await GmailService.sendEmail(
                    req.body,
                    req.user._id
                );
                return res.status(200).send(response);
            } else if (value.accountType === "OUTLOOK") {
                const response = await OutlookService.sendEmail(
                    req.body,
                    req.user._id
                );
                return res.status(200).send(response);
            } // add else condition for other email services
        } catch (error) {
            return next(error);
        }
    },
    getAuthUrl: async (req, res, next) => {
        const { error, value } = getAuthUrlReqSchema.validate(req.query);
        if (error) return next(error);
        const userId = req.user._id.toString();
        try {
            if (value.accountType === "GMAIL") {
                const authUrl = await GmailService.generateAuthUrl(userId);
                return res.status(200).send(authUrl);
            } else if (value.accountType === "OUTLOOK") {
                const authUrl = await OutlookService.generateAuthUrl(userId);
                return res.status(200).send(authUrl);
            }
        } catch (error) {
            return next(error);
        }
    },
    getAuthCallBack: async (req, res, next) => {
        try {
            const response = await GmailService.getAuthCallBack(req.query);
            return res.redirect(
                process.env.REDIRECT_AFTER_AUTH ||
                    "https://audio-emailer-dev.onrender.com"
            );
        } catch (error) {
            return next(error);
        }
    },
    updateLabels: async (req, res, next) => {
        const { error, value } = updateLabelsReqSchema.validate(req.body);
        if (error) return next(error);
        try {
            const response = await GmailService.updateLabels(
                value,
                req.user._id
            );
            return res.status(200).send(response);
        } catch (error) {
            return next(error);
        }
    },
    getAuthCallBackOutlook: async (req, res, next) => {
        try {
            const response = await OutlookService.getAuthCallBack(
                req.query.code,
                req.originalUrl
            );
            return res.status(200).json({
                message:
                    "Authentication successful! You can now access Outlook Mail.",
            });
        } catch (error) {
            return next(error);
        }
    },
});
