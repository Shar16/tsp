const Joi = require("joi");

const GMAIL_LABELS = [
    "INBOX",
    "SENT",
    "TRASH",
    "UNREAD",
    "IMPORTANT",
    "STARRED",
    "DRAFT",
];

const getAuthUrlReqSchema = Joi.object({
    accountType: Joi.string().valid("GMAIL", "OUTLOOK").default("GMAIL"),
});

const getEmailsReqSchema = Joi.object({
    accountType: Joi.string().valid("GMAIL", "OUTLOOK").default("GMAIL"),
    skip: Joi.number().integer().default(0),
    limit: Joi.number().integer().default(10),
    email: Joi.string().email().required(),
    labelIds: Joi.string()
        .valid(...GMAIL_LABELS)
        .optional(),
});

const getEmailAttachementReqSchema = Joi.object({
    emailId: Joi.string().required(), // threadId
    attachmentId: Joi.string().required(),
    fileName: Joi.string().required(),
    email: Joi.string().optional(),
    contentType: Joi.string().optional(),
});

const sendEmailReqSchema = Joi.object({
    accountType: Joi.string().valid("GMAIL", "OUTLOOK").default("GMAIL"),
    to: Joi.string().email().required(),
    subject: Joi.string().required(),
    text: Joi.string().required(),
    email: Joi.string().email().required(),
});

const updateLabelsReqSchema = Joi.object({
    email: Joi.string().email().required(),
    threadId: Joi.string().required(),
    addLabelIds: Joi.string()
        .valid(...GMAIL_LABELS)
        .optional(),
    removeLabelIds: Joi.string()
        .valid(...GMAIL_LABELS)
        .optional(),
});

module.exports = {
    GMAIL_LABELS,
    getAuthUrlReqSchema,
    getEmailsReqSchema,
    sendEmailReqSchema,
    updateLabelsReqSchema,
    getEmailAttachementReqSchema,
};
