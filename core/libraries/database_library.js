/**
 * @file Library module for interfacing with the Sequelize database and it's structures. Uses a CRUD layout.
 * @author Avenze
 * @since 1.0.0
 * @version 1.0.0
 */

module.exports = {
	async CreateRecordInDatabase(database, identifier, data) {
		const SelectedSequelizeDatabase = global.Databases[database];

		try {
			const CreatedRecord = await SelectedSequelizeDatabase.create({
			  	identifier: identifier,
			  	jsonData: data,
			});

			console.log("-- [database_library]: successfully created record for " + identifier + " in " + database);

			return data;
		} catch (error) {
			console.error('[database_library]: recieved critical error while creating data in database, ' + database + ", with identifier, " + identifier + ", with error: " + error);
			
			throw error;
		};

	},

	async ReadRecordInDatabase(database, identifier) {
		const SelectedSequelizeDatabase = global.Databases[database];
		
		try {
			const ReadRecord = await SelectedSequelizeDatabase.findOne({
			  	where: { identifier: identifier },
			});

			console.log("-- [database_library]: successfully read record for " + identifier + " in " + database);

			return ReadRecord;
		} catch (error) {
			console.error('[database_library]: recieved critical error while reading data in database, ' + database + ", with identifier, " + identifier + ", with error: " + error);

			throw error;
		};

	},

	async UpdateRecordInDatabase(database, identifier, data) {
		const SelectedSequelizeDatabase = global.Databases[database];

		try {
			const [ UpdatedRows ] = await DataModel.update(
			  	{ jsonData: data },
			  	{
					where: { identifier: identifier },
					returning: true,
			  	}
			);
		
			if (UpdatedRows === 0) {
			  	throw new Error('Data not found');
			}

			console.log("-- [database_library]: successfully updated record for " + identifier + " in " + database);
		
			return data;
		} catch (error) {
			console.error('[database_library]: recieved critical error while updating data in database, ' + database + ", with identifier, " + identifier + ", with error: " + error);

			throw error;
		};

	},

	async DeleteRecordInDatabase(database, identifier) {
		const SelectedSequelizeDatabase = global.Databases[database];

		try {
			const DeletedRows = await SelectedSequelizeDatabase.destroy({
			  	where: { identifier: identifier },
			});
		
			if (DeletedRows === 0) {
			  	throw new Error('Data not found');
			}

			console.log("-- [database_library]: successfully deleted record for " + identifier + " in " + database);
		
			return 'Data deleted successfully';
		  } catch (error) {
			console.error('[database_library]: recieved critical error while deleting data in database, ' + database + ", with identifier, " + identifier + ", with error: " + error);

			throw error;
		  }
	},

	async FetchAllRecordsFromDatabase(database) {
		const SelectedSequelizeDatabase = global.Databases[database];

		try {
			const FetchedRecords = await SelectedSequelizeDatabase.findAll();

			console.log("-- [database_library]: successfully fetched all records for " + database);

			return FetchedRecords;
		} catch (error) {
			console.error('[database_library]: recieved critical error while deleting data in database, ' + database + ", with error: " + error);

			throw error;
		}
	},
}