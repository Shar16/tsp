const { UsersModel } = require("../../src/models/users.model");

async function seedUsers() {
    const data = {
        name: "Alice",
        email: "alice@example.com",
        password:
            "a170005331f148893fe075ba347f388f72b901756c53d6ad6044185358336145166737b46f13875f648f1d502a103c99ac87afa451182c79d9a540ba597847f4:b33565566547cade36c1395329c1c67988070e78ededefee3c144249d5a693fd",
        linkedAccounts: [],
    };
    const user = new UsersModel(data);
    await user.save();
}

module.exports = { seedUsers };
