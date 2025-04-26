const R = require("ramda");

const decode = (base64String = "") => {
    const decodedBuffer = Buffer.from(base64String, "base64");
    return decodedBuffer.toString("utf-8");
};

const extractMessageHeader = (message) => (name) => {
    const headers = R.path(["payload", "payload", "headers"])(message) || [];
    return R.compose(
        R.prop("value"),
        R.defaultTo({}),
        R.find(R.propEq(name, "name"))
    )(headers);
};

const extractTextOrHtml = (part) => {
    return R.compose(decode, R.path(["body", "data"]))(part);
};

// Can do a recursive solution, but this will do for now
// Ref: https://www.ehfeng.com/gmail-api-mime-types/
const extractMessagePart = (part, { texts, attachments }) => {
    if (part.mimeType === "multipart/alternative") {
        const subParts = R.compose(
            R.map(extractTextOrHtml),
            R.prop("parts")
        )(part);
        texts.push(...subParts);
    } else if (
        part.mimeType === "text/plain" ||
        part.mimeType === "text/html"
    ) {
        texts.push(extractTextOrHtml(part));
    } else if (part.mimeType === "multipart/related") {
        const subParts = part.parts || [];
        subParts.forEach((part) => {
            extractMessagePart(part, { texts, attachments });
        });
    } else {
        // Most likely an attachment
        const response = {
            filename: part.filename,
            mimeType: part.mimeType,
            attachmentId: R.path(["body", "attachmentId"])(part),
        };
        attachments.push(response);
    }
};

const formatGmailMessageResponse = (message) => {
    const extractHeader = extractMessageHeader(message);
    const payload = R.path(["payload", "payload"])(message);
    const payloadMimeType = payload.mimeType;

    const texts = [];
    const attachments = [];

    // Top level mimetype
    if (payloadMimeType === "text/plain") {
        // This is expected for text-only emails
        const body = extractTextOrHtml(payload);
        texts.push(body);
    } else {
        // For some reason, gmail will respond differently if there are attachments or long texts "multipart/mixed" or "multipart/alternative" e.g
        const parts = payload.parts || [];
        parts.forEach((part) => {
            extractMessagePart(part, { texts, attachments });
        });
    }

    return {
        threadId: message.threadId,
        labelIds: R.path(["payload", "labelIds"])(message),
        snippet: R.path(["payload", "snippet"])(message),
        from: extractHeader("From"),
        to: extractHeader("To"),
        Cc: extractHeader("Cc"),
        Bcc: extractHeader("Bcc"),
        date: extractHeader("Date"),
        subject: extractHeader("Subject"),
        texts,
        attachments,
    };
};

module.exports = { formatGmailMessageResponse };
