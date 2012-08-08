
exports.diagLoggingLevel = 1;

//=============================== Logger_Diag
// Logger will become a class with method Diag()
// At least this will be easy to search and replace
exports.Logger_Diag = function (argDiagLevel, strMsg){
	// A high diagLoggingLevel means more info will be included in diagnostics
	if (argDiagLevel <= module.exports.diagLoggingLevel){
		console.error(strMsg);
	}
}

