/**
 * @file Primary application handler that runs everything, initializes modules etc.
 * @author Avenze
 * @since 1.0.0
 * @version 1.0.0
 */

/**********************************************************************
 * @description Initialize all variables & dependencies.
 */

const { loggingLibrary } = require("./core/libraries");
const { webserverModule, akauntingModule, databaseModule } = require("./core/modules");

/**********************************************************************
 * @description Initialize application section.
 */

async function Main() {

	loggingLibrary.SendLargeLogEntry("tebex_akaunting_exporter is currently starting up...");

	// ** Initialize Global Variables & Tables

	global.Databases = {
		"AlreadyProcessed": null,
		"ToBeProcessed": null
	};

	// ** Initialize Database Module

	loggingLibrary.SendSingleLineEntry("[database_module]: triggering database_module startup method...");
	await databaseModule.InitializeModule();

	// ** Initialize Webserver Module

	loggingLibrary.SendSingleLineEntry("[webserver_module]: triggering webserver_module startup method...");
	await webserverModule.InitializeModule();

	// ** Initialize Akaunting Module

	loggingLibrary.SendSingleLineEntry("[akaunting_module]: triggering akaunting_module startup method...");
	await akauntingModule.InitializeModule();

	loggingLibrary.SendLargeLogEntry("tebex_akaunting_exporter has successfully passed all module initializations.");

};

Main();