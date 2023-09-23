/**
 * @file The module contains all logic functionality for the database integration.
 * @author Avenze
 * @since 1.0.0
 * @version 1.0.0
 */

/**********************************************************************
 * @description Initialize all variables, dependencies & internal functions.
 */

const { Sequelize } = require('sequelize');
const fs = require("fs");

const { loggingLibrary, databaseLibrary } = require("../libraries");
const { databaseConfiguration } = require("../../config");

/**********************************************************************
 * @description Initialize export functions
 */

module.exports = {
	async InitializeModule() {
		
		loggingLibrary.SendSingleLineEntry("[database_module_internal]: recieved startup trigger...");

		try {
			loggingLibrary.SendSingleLineEntry("[database_module_internal]: attempting to initialize sequelize sqlite database...");
			global.database = await new Sequelize({
				dialect: 'sqlite',
				storage: databaseConfiguration.DatabaseStorageLocation
			});
		
			loggingLibrary.SendSingleLineEntry("[database_module_internal]: success.");
		} catch (error) {
			console.log("[database]: Failed to initiate connection to database.".red);
			loggingLibrary.SendSingleLineEntry("[database_module_internal]: failed to initialize sequelize...");
			console.error(error);
		}

		try {
			loggingLibrary.SendSingleLineEntry("[database_module_internal]: attempting to register database structure models...");
		
			const structureFiles = fs
				.readdirSync(databaseConfiguration.StructureLocation)
				.filter((file) => file.endsWith(".js"));
		
			for (const structureFile of structureFiles) {
				const structure = require(`../database/structures/${structureFile}`);
				structure.execute();
			}
		
			loggingLibrary.SendSingleLineEntry("[database_module_internal]: successfully registered structures.");
		} catch (error) { 
			loggingLibrary.SendSingleLineEntry("[database_module_internal]: failed to register structures.");
			console.error(error);
		}

		try {
			loggingLibrary.SendSingleLineEntry("[database_module_internal]: attempting to synchronize all database structures...");
		
			await global.database.sync();
		
			loggingLibrary.SendSingleLineEntry("[database_module_internal]: successfully synchronized structures.");
		} catch (error) { 
			loggingLibrary.SendSingleLineEntry("[database_module_internal]: failed to synchronize structures.");
			console.error(error);
		}

		loggingLibrary.SendSingleLineEntry("[database_module_internal]: successfully started database_module.");

	}
};