const router = require("express").Router();
const { checkAuth } = require("./middlewares/auth.middleware");

module.exports = (container) => {
    // User routes
    router.post(
        "/users/register",
        container.cradle.UsersController.registerUser
    );
    router.post("/users/login", container.cradle.UsersController.loginUser);
    router.patch(
        "/settings",
        checkAuth,
        container.cradle.UsersController.updateUserSettings
    );
    router.get(
        "/settings",
        checkAuth,
        container.cradle.UsersController.getUserSettings
    );

    // Email routes

    router.get(
        "/emails/auth",
        checkAuth,
        container.cradle.EmailsController.getAuthUrl
    );

    router.get(
        "/emails/auth/callback",
        container.cradle.EmailsController.getAuthCallBack
    );

    router.get(
        "/emails/auth/outlook/callback",
        container.cradle.EmailsController.getAuthCallBackOutlook
    );

    router.get(
        "/emails",
        checkAuth,
        container.cradle.EmailsController.getEmails
    );
    router.get(
        "/emails/attachment",
        checkAuth,
        container.cradle.EmailsController.getEmailAttachement
    );
    router.post(
        "/emails",
        checkAuth,
        container.cradle.EmailsController.sendEmail
    );
    router.post(
        "/emails/update/labels",
        checkAuth,
        container.cradle.EmailsController.updateLabels
    );

    return router;
};
