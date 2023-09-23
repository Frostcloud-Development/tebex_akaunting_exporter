/**
 * @file Database structure file for setting up the ToBeProcessed model structure.
 * @author Avenze
 * @since 1.0.0
 */

const { Sequelize, DataTypes } = require("sequelize");
var ToBeProcessed = null;

module.exports = {

	/**
	 * @description Main handler function for registering the database model structure.
	 */

	execute() {
		global.Databases["ToBeProcessed"] = global.database.define('ToBeProcessed', {
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
		return ToBeProcessed;
	},
};
