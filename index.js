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
const { webserverModule } = require("./core/modules");

/**********************************************************************
 * @description Initialize application section.
 */

loggingLibrary.SendLargeLogEntry("tebex_akaunting_exporter is currently starting up...");

loggingLibrary.SendSingleLineEntry("[webserver_module]: triggering webserver_module startup method...");
webserverModule.InitializeModule();