const { dummyEmails } = require("../utils/DummyEmails");

module.exports = ({}) => ({
    getDummyEmails: async ({ skip, limit }) => {
        const data = dummyEmails.slice(skip, skip + limit);
        return {
            data,
            count: dummyEmails.length,
        };
    },
});
