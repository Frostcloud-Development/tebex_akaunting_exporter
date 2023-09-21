/**
 * @file Library module for handling all logging functions.
 * @author Avenze
 * @since 1.0.0
 * @version 1.0.0
 */

module.exports = {
	SendLargeLogEntry(message) {
		console.log("-------------------------------------------------------------------")
		console.log("---- " + message)
		console.log("-------------------------------------------------------------------")
	},
	SendSingleLineEntry(message) {
		console.log("-- " + message)
	}
}