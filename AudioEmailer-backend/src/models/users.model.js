const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    // User PIDs
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    linkedAccounts: {
        type: [
            {
                service: {
                    type: String,
                    required: true,
                    enum: ["GMAIL", "YAHOO"],
                },
                email: {
                    type: String,
                    required: true,
                },
                accessToken: {
                    type: String,
                    required: true,
                },
                refreshToken: {
                    type: String,
                    required: true,
                },
                accessTokenExpiresAt: {
                    type: Number,
                    required: false,
                },
                refreshTokenExpiresAt: {
                    type: Number,
                    required: false,
                },
                expiresAt: {
                    type: Number,
                    required: false,
                },
            },
        ],
        default: [],
    },
    // Settings
    colorMode: {
        type: String,
        enum: ["LIGHT", "DARK"],
        default: "LIGHT",
    },
    contrastMode: {
        type: String,
        enum: ["HIGH", "LOW"],
        default: "LOW",
    },
    readingSpeed: {
        type: Number,
        default: 100,
    },
    amplitude: {
        type: Number,
        default: 100,
    },
    pauseDuration: {
        // ms
        type: Number,
        default: 1000,
    },
    assistantVoice: {
        type: String,
        enum: ["ALICE", "BOB", "CHARLIE"],
        default: "ALICE",
    },
});

const UsersModel = mongoose.model("User", usersSchema);
module.exports = { UsersModel };
