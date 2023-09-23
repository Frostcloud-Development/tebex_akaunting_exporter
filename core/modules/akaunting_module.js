/**
 * @file The module contains all logic functionality for the Akaunting integration, that pushes to your specified Akaunting backend.
 * @author Avenze
 * @since 1.0.0
 * @version 1.0.0
 */

/**********************************************************************
 * @description Initialize all variables, dependencies & internal functions.
 */

const nodecron = require("node-cron");
const axios = require("axios");
const https = require("https");
const fs = require("fs");

const { loggingLibrary, queueLibrary, databaseLibrary, commonLibrary } = require("../libraries");
const { akauntingConfiguration } = require("../../config");
const { akauntingModule } = require(".");

const CertificateAuthority = fs.readFileSync("config/certificate.crt");

function ParseParameters(parameters) {
	const keys = Object.keys(parameters)
	let options = ''
  
	keys.forEach((key) => {
	  	const isParamTypeObject = typeof parameters[key] === 'object'
	  	const isParamTypeArray = isParamTypeObject && parameters[key].length >= 0
  
	  	if (!isParamTypeObject) {
			options += `${key}=${parameters[key]}&`
	  	}
  
	  	if (isParamTypeObject && isParamTypeArray) {
			parameters[key].forEach((element) => {
		  		options += `${key}=${element}&`
			})
	  	}
	})
  
	return options ? options.slice(0, -1) : options
};

/**********************************************************************
 * @description Initialize export functions
 */

module.exports = {
	async InitializeModule() {
		
		loggingLibrary.SendSingleLineEntry("[akaunting_module_internal]: recieved startup trigger...");

		const RunScheduledFunction = async () => {

			const RequiresProcessing = await databaseLibrary.FetchAllRecordsFromDatabase("ToBeProcessed");
			const HTTPSAgent = new https.Agent({ ca: CertificateAuthority, keepAlive: false });
	
			RequiresProcessing.forEach(async (Record) => {
				const { identifier, jsonData } = Record;
	
				// ** Validate if a customer record exists within Akaunting, if not, create it.
	
				const CustomerConstructedName = jsonData.orderCustomer.customerFirstName + " " + jsonData.orderCustomer.customerLastName;
				let FoundCustomerObject = false;
				let FoundCustomerID = null;
	
				let CustomerSearchResponse = false;
				let CustomerCreateResponse = false;
				let InvoiceCreateResponse = false;
				let TransactionCreateResponse = false;
	
				let ItemQuantity = 0;
				let ItemPrice = 0;
				let ItemPriceCurrency = "USD";
	
				try {
	
					// ** Construct all request array objects
	
					const RequestParameters = {
						search: "type:customer name:'" + CustomerConstructedName + "'",
						page: "1",
						limit: "25",
					};
					const RequestAuth = {
						username: akauntingConfiguration.AkauntingEmail,
						password: akauntingConfiguration.AkauntingPassword,
					};
					const RequestHeaders = {
						"X-Company": akauntingConfiguration.AkauntingCompanyID,
					};
					const ConstructedRequest = {
						url: akauntingConfiguration.AkauntingURL + "/api/contacts",
						method: "get",
						httpsAgent: HTTPSAgent,
						headers: RequestHeaders,
						params: RequestParameters,
						//paramsSerializer: (params) => ParseParameters(params),
						auth: RequestAuth,
					};
	
					// ** Send request to Akaunting API endpoint
					
					CustomerSearchResponse = await axios.request(ConstructedRequest);
	
					// ** Finished
	
					loggingLibrary.SendSingleLineEntry("[akaunting_module_internal]: searched all accounts for payment with name, " + CustomerConstructedName);
	
				} catch (err) {
					console.error(err);
				};
	
				try {
	
					if (CustomerSearchResponse.data.meta.total == 0) {
	
						// ** Construct all request array objects
	
						const RequestParameters = {
							search: "type:customer",
							name: CustomerConstructedName,
							email: jsonData.orderCustomer.customerEmail,
							website: jsonData.orderCustomer.customerIP,
							country: jsonData.orderCustomer.customerCountry,
							currency_code: "USD",
							type: "customer",
						};
						const RequestAuth = {
							username: akauntingConfiguration.AkauntingEmail,
							password: akauntingConfiguration.AkauntingPassword,
						};
						const RequestHeaders = {
							"X-Company": akauntingConfiguration.AkauntingCompanyID,
						};
						const ConstructedRequest = {
							url: akauntingConfiguration.AkauntingURL + "/api/contacts",
							method: "post",
							httpsAgent: HTTPSAgent,
							headers: RequestHeaders,
							params: RequestParameters,
							//paramsSerializer: (params) => ParseParameters(params),
							auth: RequestAuth,
						};
	
						// ** Send request to Akaunting API endpoint
	
						CustomerCreateResponse = await axios.request(ConstructedRequest);
	
						// ** Validate and store customer ID for invoice creation
	
						FoundCustomerObject = true;
						FoundCustomerID = CustomerCreateResponse.data.data.id;
	
						// ** Finished
	
						loggingLibrary.SendSingleLineEntry("[akaunting_module_internal]: created an account on akaunting for name, " + CustomerConstructedName + " on payment, " + jsonData.orderTransaction);
					
					} else {
	
						// ** Iterate trough response data for customer ID
	
						CustomerSearchResponse.data.data.forEach((item) => {
							if (item.name === CustomerConstructedName) {
								FoundCustomerObject = true;
								FoundCustomerID = item.id;
							}
						});
	
						// ** Finished
						
						loggingLibrary.SendSingleLineEntry("[akaunting_module_internal]: fetched an account on akaunting for for name, " + CustomerConstructedName + " on payment, " + jsonData.orderTransaction);
	
					}
	
				} catch (err) {
					console.error(err);
				}
	
				try {
	
					// ** Construct and find items array
	
					jsonData.orderProducts.forEach((item) => {
						if (item.id === akauntingConfiguration.TebexProductID) {
							ItemQuantity = item.quantity;
							ItemPrice = item.paid_price.amount;
							ItemPriceCurrency = item.paid_price.currency;
						};
					});
	
					// ** Construct all request array objects
	
					const YYYYMMDD = commonLibrary.GetCurrentDateYYYYMMDD();
	
					const RequestParameters = {
						search: "type:invoice",
						type: "invoice",
						category_id: akauntingConfiguration.AkauntingIncomeCategory,
						document_number: identifier,
						status: "paid",
						issued_at: YYYYMMDD,
						due_at: YYYYMMDD,
						currency_code: "USD",
						currency_rate: 1,
						contact_id: FoundCustomerID,
						contact_name: CustomerConstructedName,
						contact_email: jsonData.orderCustomer.customerEmail,
						"items[0][item_id]": akauntingConfiguration.AkauntingProductID,
						"items[0][name]": "Personal Vehicle Key",
						"items[0][quantity]": ItemQuantity,
						"items[0][price]": ItemPrice,
						amount: 0
					};
					const RequestAuth = {
						username: akauntingConfiguration.AkauntingEmail,
						password: akauntingConfiguration.AkauntingPassword,
					};
					const RequestHeaders = {
						"X-Company": akauntingConfiguration.AkauntingCompanyID,
					};
					const ConstructedRequest = {
						url: akauntingConfiguration.AkauntingURL + "/api/documents",
						method: "post",
						httpsAgent: HTTPSAgent,
						headers: RequestHeaders,
						params: RequestParameters,
						//paramsSerializer: (params) => ParseParameters(params),
						auth: RequestAuth,
					};
	
					// ** Send request to Akaunting API endpoint
	
					InvoiceCreateResponse = await axios.request(ConstructedRequest);
	
					loggingLibrary.SendSingleLineEntry("[akaunting_module_internal]: created an invoice on akaunting for name, " + CustomerConstructedName + " on payment, " + jsonData.orderTransaction);
	
				} catch (err) {
					console.error(err);
				};
	
				try {
	
					// ** Construct all request array objects
	
					const YYYYMMDD = commonLibrary.GetCurrentDateYYYYMMDD();
					const UUIDv4 = commonLibrary.GetUUIDv4();
	
					const RequestParameters = {
						search: "type:income",
						type: "income",
						paid_at: YYYYMMDD,
						payment_method: "offline-payments.cash.1",
						account_id: akauntingConfiguration.AccountID,
						amount: (ItemQuantity * ItemPrice),
						category_id: akauntingConfiguration.AkauntingIncomeCategory,
						contact_id: FoundCustomerID,
						number: UUIDv4,
						reference: jsonData.orderTransaction,
						currency_code: "USD",
						currency_rate: 1,
					};
					const RequestAuth = {
						username: akauntingConfiguration.AkauntingEmail,
						password: akauntingConfiguration.AkauntingPassword,
					};
					const RequestHeaders = {
						"X-Company": akauntingConfiguration.AkauntingCompanyID,
					};
					const ConstructedRequest = {
						url: akauntingConfiguration.AkauntingURL + "/api/transactions",
						method: "post",
						httpsAgent: HTTPSAgent,
						headers: RequestHeaders,
						params: RequestParameters,
						//paramsSerializer: (params) => ParseParameters(params),
						auth: RequestAuth,
					};
	
					// ** Send request to Akaunting API endpoint
	
					TransactionCreateResponse = await axios.request(ConstructedRequest);
	
					loggingLibrary.SendSingleLineEntry("[akaunting_module_internal]: created an income transaction on akaunting for name, " + CustomerConstructedName + " on payment, " + jsonData.orderTransaction);
	
				} catch (err) {
					console.error(err);
				};
	
				try {
	
					databaseLibrary.DeleteRecordInDatabase("ToBeProcessed", jsonData.orderTransaction);
					loggingLibrary.SendSingleLineEntry("[akaunting_module_internal]: finished processing a payment from tebex by, " + CustomerConstructedName + " with payment, " + jsonData.orderTransaction);
	
				} catch (err) {
					console.error(err);
				}
	
			});
	
		}

		nodecron.schedule('*/1 * * * *', RunScheduledFunction)

		loggingLibrary.SendSingleLineEntry("[akaunting_module_internal]: successfully started akaunting_module.");

	}
};