const express = require("express");
const cors = require("cors");
const { ValidationError } = require("joi");
const { connectDB } = require("./db");
const injectModulesToRoutes = require("./routes");
const { CustomError } = require("./utils/CustomError");
const { checkAuth } = require("./middlewares/auth.middleware");
const { gmail } = require("./email-providers/gmail");
const initContainer = require("./loader");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
    return res.status(200).send({ message: "Hello Team Octa!" });
});

app.get("/auth", checkAuth, (req, res) => {
    return res.status(200).send({ message: "Hello Authenticated User!" });
});

const container = initContainer(["models", "services", "controllers"]);
app.use("/api", injectModulesToRoutes(container));

// Error Handling
app.use((error, req, res, next) => {
    if (error instanceof ValidationError) {
        return res.status(422).send({
            code: 422,
            message: error.details[0].message,
        });
    }

    // Caught HTTP errors
    if (error instanceof CustomError) {
        return res.status(400).send({
            code: 400,
            message: error.message,
        });
    } else {
        // Uncaught Errors
        console.group("[ServerError]: ", error.message);
        console.error("[STACK]: ", error.stack);

        return res.status(500).send({
            code: 500,
            message: "INTERNAL SERVER ERROR",
        });
    }
});

app.use((req, res, next) =>
    res.status(404).send({
        code: 404, // If no routes match
        message: "Resource Not Found",
    })
);

const PORT = process.env.PORT || 3000;
const isTesting = process.env.ENV === "test";
(async function main() {
    if (!isTesting) {
        connectDB();
        app.listen(PORT, () => {
            console.log(`Listening on PORT ${PORT}`);
        });
    }
})();

module.exports = app;
