/**
 * @file Express handler for validating the request body from Tebex.io
 * @author Avenze
 * @since 1.0.0
 * @version 1.0.0
 */

/**********************************************************************
 * @description Initialize all variables, dependencies & internal functions.
 */

const express = require("express");
const expressRouter = express.Router();

const { loggingLibrary } = require("../libraries");

/**********************************************************************
 * @description Initialize export functions
 */

expressRouter.use("/", (Request, Response, Continue) => {

	const RequestSourceIP = Request.socket.remoteAddress;

	if (RequestSourceIP === '::ffff:18.209.80.3' || RequestSourceIP === '::ffff:54.87.231.232') { 
		Continue(); 
	} else {
        console.log(colors.red(`[validate]: ${RequestSourceIP}`));
		loggingLibrary.SendSingleLineEntry("[webserver_module_validateRequestBody]: recieved an unauthorized request from " + RequestSourceIP)
        return Response.status(403).jsonp({ error: 'Unauthorized Request' });
    }
});

module.exports = expressRouter;