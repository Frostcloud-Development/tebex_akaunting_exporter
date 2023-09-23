/**
 * @file Database structure file for setting up the AlreadyProcessed model structure.
 * @author Avenze
 * @since 1.0.0
 */

const { Sequelize, DataTypes } = require("sequelize");
var AlreadyProcessed = null;

module.exports = {

	/**
	 * @description Main handler function for registering the database model structure.
	 */

	execute() {
		global.Databases["AlreadyProcessed"] = global.database.define('AlreadyProcessed', {
			identifier: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			jsonData: {
				type: DataTypes.JSONB,
				allowNull: false,
			},
		});
	},

	getModel() {
		return AlreadyProcessed;
	},
};
