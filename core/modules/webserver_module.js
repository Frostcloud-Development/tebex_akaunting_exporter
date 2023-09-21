/**
 * @file The module contains all logic functionality for the application webserver that responds to requests.
 * @author Avenze
 * @since 1.0.0
 * @version 1.0.0
 */

/**********************************************************************
 * @description Initialize all variables, dependencies & internal functions.
 */

const express = require("express");

const { loggingLibrary } = require("../libraries");
const { webserverConfiguration } = require("../../config");
const { validateRequestBody, validateRequestOrigin } = require("../handlers");

/**********************************************************************
 * @description Initialize export functions
 */

module.exports = {
	InitializeModule() {
		
		loggingLibrary.SendSingleLineEntry("[webserver_module_internal]: recieved startup trigger...");

		const ExpressApp = express();

		ExpressApp.use(express.json(), validateRequestBody, validateRequestOrigin);
		ExpressApp.use(express.urlencoded({ extended: true }));
		ExpressApp.post("/webhook/", async function (Request, Response, Next) {

			// Handle Webhook Validation Endpoint

			console.log("request recieved")

			console.log(Request.body)

		});

		loggingLibrary.SendSingleLineEntry("[webserver_module_internal]: starting express application and listening to configured port...");

		ExpressApp.listen(webserverConfiguration.ApplicationPort, () => {
			loggingLibrary.SendSingleLineEntry("[webserver_module_internal]: successfully started listening on configured port, " + webserverConfiguration.ApplicationPort);
		});

	}
};