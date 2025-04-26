const awilix = require("awilix");

const registerValues = (container, mapping) => {
    Object.keys(mapping).forEach((key) => {
        let model = mapping[key];
        container.register({
            [key]: awilix.asValue(model),
        });
    });
};

const registerFunctions = (container, mapping) => {
    Object.keys(mapping).forEach((key) => {
        let model = mapping[key];
        container.register({
            [key]: awilix.asFunction(model),
        });
    });
};

// This magic of automatic inversion of control using awilix happens here
function loadModels(container) {
    registerValues(container, {
        UsersModel: require("./models/users.model.js").UsersModel,
    });
}

function loadServices(container) {
    registerFunctions(container, {
        UsersService: require("./services/users.service.js"),
        EmailsService: require("./services/emails.service.js"),
        GmailService: require("./services/gmail.service.js"),
        OutlookService: require("./services/outlook.service.js"),
    });
}

function loadControllers(container) {
    registerFunctions(container, {
        UsersController: require("./controllers/users.controller.js"),
        EmailsController: require("./controllers/emails.controller.js"),
    });
}

function initContainer(layers = []) {
    const container = awilix.createContainer();
    const layerMapping = {
        models: loadModels,
        services: loadServices,
        controllers: loadControllers,
    };

    layers = layers.filter((l) => Object.keys(layerMapping).includes(l));
    layers.forEach((key) => layerMapping[key](container)); // Above functions are called here, and layers are injected
    return container;
}

module.exports = initContainer;
