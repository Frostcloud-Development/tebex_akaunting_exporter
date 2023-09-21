/**
 * @file Express handler for returning the body to correct validation.webhook requests.
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
	
	const RequestBody = Request.body

	if (RequestBody && RequestBody.type == "validation.webhook") {
		return Response.status(200).json(RequestBody);
		console.log(RequestBody)
	} else {
		Continue();
	};

});

module.exports = expressRouter;