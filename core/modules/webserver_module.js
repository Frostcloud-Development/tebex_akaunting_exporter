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

const { loggingLibrary, queueLibrary, databaseLibrary } = require("../libraries");
const { webserverConfiguration } = require("../../config");
const { validateRequestBody, validateRequestOrigin } = require("../handlers");

/**********************************************************************
 * @description Initialize export functions
 */

module.exports = {
	async InitializeModule() {
		
		loggingLibrary.SendSingleLineEntry("[webserver_module_internal]: recieved startup trigger...");

		const ExpressApp = express();

		ExpressApp.use(express.json(), validateRequestBody, validateRequestOrigin);
		ExpressApp.use(express.urlencoded({ extended: true }));
		ExpressApp.post("/webhook/", async function (Request, Response, Next) {

			// Handle Incoming Payment Webhook

			const RequestBody = Request.body;
			const RequestSubject = RequestBody.subject;

			if (RequestBody.type == "payment.completed") {

				if (RequestSubject.status.description == "Complete") {

					loggingLibrary.SendSingleLineEntry("[webserver_module_internal]: recieved webhook request with a completed payment.completed status.");

					const IsAlreadyProcessed = queueLibrary.DoesQueueEntryExist("AlreadyProcessedPayments", RequestSubject.transaction_id);

					if (IsAlreadyProcessed == false) {

						let ConstructedCustomerObject = {
							"customerFirstName": RequestSubject.customer.first_name,
							"customerLastName": RequestSubject.customer.last_name,
							"customerEmail": RequestSubject.customer.email,
							"customerIP": RequestSubject.customer.ip,
							"customerUsername": RequestSubject.customer.username.username,
							"customerId": RequestSubject.customer.username.id,
							"customerCountry": RequestSubject.customer.country,
						};
	
						let ConstructedPurchaseObject = {
							"orderId": RequestBody.id,
							"orderType": RequestBody.type,
							"orderDate": RequestBody.date,
							"orderTransaction": RequestSubject.transaction_id,
							"orderAmount": RequestSubject.price_paid.amount,
							"orderCustomer": ConstructedCustomerObject,
							"orderProducts": RequestSubject.products
						};
						
						queueLibrary.NewQueueEntry("AlreadyProcessedPayments", RequestSubject.transaction_id, ConstructedPurchaseObject); // create a queue entry for this specific payment, as payment webhooks sometimes gets triggered twice. (COMMENTED OUT DUE TO THE FACT THAT IT SIMPLY GETS CALLED TWICE BECAUSE WHILE I WAS TESTING, IT RETRIED SENDING IT DUE TO THE FACT THAT IT NEVER WORKED)
						databaseLibrary.CreateRecordInDatabase("ToBeProcessed", RequestSubject.transaction_id, ConstructedPurchaseObject);

						Response.status(200).json({"message": "Successfully validated the webhook request."});

						loggingLibrary.SendSingleLineEntry("[webserver_module_internal]: submitted payment object to the to be processed queue, awaiting processing by akaunting_module.");

					} else {
						Response.status(202).json({"message": "Payment request already exists."});
					};

				};

			};

		});

		loggingLibrary.SendSingleLineEntry("[webserver_module_internal]: starting express application and listening to configured port...");

		ExpressApp.listen(webserverConfiguration.ApplicationPort, () => {
			loggingLibrary.SendSingleLineEntry("[webserver_module_internal]: successfully started listening on configured port, " + webserverConfiguration.ApplicationPort);
		});

	}
};