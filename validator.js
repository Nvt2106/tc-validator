'use strict';

if (typeof require !== 'undefined') {
	var moment = require('moment');
}

var Validator = Validator || {};

Validator.isNull = function(myVar) {
	return (myVar == undefined || myVar.length == 0);
}

Validator.isNumber = function(myVar) {
    return !isNaN(myVar)
}

Validator.isString = function(myVar) {
	return (typeof myVar === 'string' || myVar instanceof String);
}

Validator.isArray = function(myVar) {
	return Array.isArray(myVar);
}

Validator.isObject = function(myVar) {
	return typeof myVar == 'object';
}

Validator.Date = Validator.Date || {};

Validator.Date.Moment = function(dateString) {
	return moment(dateString, 'YYYY-MM-DD');
}

Validator.Date.isDateBetween = function(date, fromDate, toDate) {
  var result = true;
  if (fromDate) {
    result = (date >= fromDate);
    if (result && toDate) {
      result = (date <= toDate);
    }
  }
  return result;
}

Validator.Date.getTodayString = function() {
  var today = new Date();
  return today.getFullYear() + '-' + (1 + today.getMonth()) + '-' + today.getDate();
}

Validator.Date.isSmallerDate = function(dateString, anotherDateString) {
  var dateMoment = Validator.Date.Moment(dateString);
  var anotherDateMoment = Validator.Date.Moment(anotherDateString);
  return (dateMoment.diff(anotherDateMoment) < 0);
}

Validator.Date.isSmallerOrEqualDate = function(dateString, anotherDateString) {
  var dateMoment = Validator.Date.Moment(dateString);
  var anotherDateMoment = Validator.Date.Moment(anotherDateString);
  return (dateMoment.diff(anotherDateMoment) <= 0);
}

Validator.Date.isPastDate = function(dateString) {
  return Validator.Date.isSmallerDate(dateString, Validator.Date.getTodayString());
}

Validator.Date.isPastOrNowDate = function(dateString) {
  return Validator.Date.isSmallerOrEqualDate(dateString, Validator.Date.getTodayString());
}

Validator.Date.isFutureDate = function(dateString) {
  return Validator.Date.isSmallerDate(Validator.Date.getTodayString(), dateString);
}

Validator.Date.isNowOrFutureDate = function(dateString) {
  return Validator.Date.isSmallerOrEqualDate(Validator.Date.getTodayString(), dateString);
}

// ++ Error code
var ErrorCodes = {
	GENERIC:           		1000,
	MANDATORY_FIELD: 		1001,
	MIN_LENGTH_VIOLATED: 	1002,
	MAX_LENGTH_VIOLATED: 	1003,
	INVALID_NUMBER: 		1004,
	MIN_VALUE_VIOLATED: 	1005,
	MAX_VALUE_VIOLATED: 	1006,
	INVALID_NUMBER_RANGE:   1007,
	INVALID_DATE:           1008,
	INVALID_DATE_RANGE:     1009,
	INVALID_CARD_NUMBER:    1010,
	INVALID_ARRAY:          1011,
	INVALID_OBJECT:         1012
};

Validator.ErrorCodes = ErrorCodes;
// -- Error code

Validator.buildErrorObject = function(code, msg, fieldName) {
	return {
		code: code,
		msg: msg,
		field_name: fieldName
	};
}

Validator.StringRule = function(fieldName, displayText, required, minLength, maxLength) {
	return {
		type: 'string',
		field_name: fieldName,
		display_text: displayText,
		required: required,
		min_length: minLength,
		max_length: maxLength,
		validate: function(fieldValue) {
			var msg = '';
			var code = '';
			if (required && Validator.isNull(fieldValue)) {
				code = ErrorCodes.MANDATORY_FIELD;
				msg = displayText + ' is required.';

			} else if (!Validator.isNull(fieldValue)) {
				if (minLength && minLength > 0 && fieldValue.length < minLength) {
					code = ErrorCodes.MIN_LENGTH_VIOLATED;
					msg = 'Length of ' + displayText + ' must be at least ' + minLength + ' char(s).';

				} else if (maxLength && maxLength > 0 && fieldValue.length > maxLength) {
					code = ErrorCodes.MAX_LENGTH_VIOLATED;
					msg = 'Length of ' + displayText + ' must not be greater than ' + maxLength + ' char(s).';
				}
			}
			return Validator.buildErrorObject(code, msg, fieldName);
		}
	};
}

Validator.NumberRule = function(fieldName, displayText, required, minValue, maxValue) {
	return {
		type: 'number',
		field_name: fieldName,
		display_text: displayText,
		required: required,
		min_value: minValue,
		max_value: maxValue,
		validate: function(fieldValue) {
		  var msg = '';
		  var code = '';
		  if (required && Validator.isNull(fieldValue)) {
		  	code = ErrorCodes.MANDATORY_FIELD;
		    msg = displayText + ' is required.';

		  } else if (fieldValue && fieldValue.length > 0) {
		    if (isNaN(fieldValue)) {
		    	code = ErrorCodes.INVALID_NUMBER;
		    	msg = displayText + ' is not a valid number.';

		    } else {
		      var number = parseFloat(fieldValue);
		      if (minValue != undefined && number < minValue) {
		      	code = ErrorCodes.MIN_VALUE_VIOLATED;
		        msg = displayText + ' must be at least ' + minValue + '.';

		      } else if (maxValue != undefined && number > maxValue) {
		      	code = ErrorCodes.MAX_VALUE_VIOLATED;
		        msg = displayText + ' must not be greater than ' + maxValue + '.';
		      }
		    }
		  }
		  return Validator.buildErrorObject(code, msg, fieldName);
		}
	};
}

Validator.NumberRangeRule = function(minFieldName, maxFieldName, displayText) {
	return {
		type: 'number_range',
		min_field_name: minFieldName,
		max_field_name: maxFieldName,
		display_text: displayText,
		validate: function(minFieldValue, maxFieldValue) {
		  var msg = '';
		  var code = '';
		  if (minFieldValue != undefined && maxFieldValue != undefined && minFieldValue > maxFieldValue) {
		  	code = ErrorCodes.INVALID_NUMBER_RANGE;
		    msg = 'Min value of ' + displayText + ' must not be greater than max value.';
		  }
		  return Validator.buildErrorObject(code, msg);
		}
	};
}

Validator.DateRule = function(fieldName, displayText, required, minValue, maxValue) {
	return {
		type: 'date',
		field_name: fieldName,
		display_text: displayText,
		required: required,
		min_value: minValue,
		max_value: maxValue,
		validate: function(fieldValue) {
		  var msg = '';
		  var code = '';
		  if (Validator.isNull(fieldValue)) {
		    if (required) {
		      code = ErrorCodes.MANDATORY_FIELD;
		      msg = displayText + ' is required.';
		    }
		  } else {
		  	var dateMoment = Validator.Date.Moment(fieldValue);
		    if (!dateMoment.isValid()) {
		    	code = ErrorCodes.INVALID_DATE;
		      msg = displayText + ' is not a valid date.'

		    } else {
		    	if (minValue && Validator.Date.isSmallerDate(fieldValue, minValue)) {
		    		code = ErrorCodes.MIN_VALUE_VIOLATED;
		    		msg = displayText + ' must not be smaller than ' + minValue;

		    	} else if (maxValue && Validator.Date.isSmallerDate(maxValue, fieldValue)) {
		    		code = ErrorCodes.MAX_VALUE_VIOLATED;
		    		msg = displayText + ' must not be greater than ' + maxValue;
		    	}
		    }
		  }
		  return Validator.buildErrorObject(code, msg, fieldName);
		}
	};
}

Validator.DateRangeRule = function(minFieldName, maxFieldName, displayText) {
	return {
		type: 'date_range',
		min_field_name: minFieldName,
		max_field_name: maxFieldName,
		display_text: displayText,
		validate: function(minFieldValue, maxFieldValue) {
		  var msg = '';
		  var code = '';
		  if (Validator.Date.isSmallerDate(maxFieldValue, minFieldValue)) {
		  	code = ErrorCodes.INVALID_DATE_RANGE;
		  	msg = displayText;
		  }
		  return Validator.buildErrorObject(code, msg);
		}
	};
}

Validator.BooleanRule = function(fieldName, displayText) {
	return {
		type: 'bool',
		field_name: fieldName,
		display_text: displayText,
		validate: function(fieldValue) {
		  var msg = '';
		  var code = '';
		  if (Validator.isNull(fieldValue)) {
		  	code = ErrorCodes.MANDATORY_FIELD;
		    msg = displayText + ' is required.';
		  }
		  return Validator.buildErrorObject(code, msg, fieldName);
		}
	};
}

Validator.ArrayRule = function(fieldName, displayText, required, minLength, maxLength) {
	return {
		type: 'array',
		field_name: fieldName,
		display_text: displayText,
		required: required,
		min_length: minLength,
		max_length: maxLength,
		validate: function(fieldValue) {
			var msg = '';
			var code = '';
			if (fieldValue != undefined && Validator.isArray(fieldValue) == false) {
				code = ErrorCodes.INVALID_ARRAY;
				msg = displayText + ' is not a valid array.';

			} else if (required) {
				if (fieldValue == undefined) {
					code = ErrorCodes.MANDATORY_FIELD;
					msg = displayText + ' is required.';

				} else if (minLength != undefined && fieldValue.length < minLength) {
					code = ErrorCodes.MIN_LENGTH_VIOLATED;
					msg = 'Length of ' + displayText + ' must be at least ' + minLength + ' element(s).';

				} else if (maxLength != undefined && fieldValue.length > maxLength) {
					code = ErrorCodes.MAX_LENGTH_VIOLATED;
					msg = 'Length of ' + displayText + ' must not be more than ' + maxLength + ' element(s).';
				}
			}
			return Validator.buildErrorObject(code, msg, fieldName);
		}
	};
}

Validator.CreditCardNumberRule = function(fieldName, displayText, required) {
	return {
		type: 'credit',
		field_name: fieldName,
		display_text: displayText,
		required: required,
		validate: function(fieldValue) {
		  var msg = '';
		  var code = '';
		  if (required && Validator.isNull(fieldValue)) {
		  	code = ErrorCodes.MANDATORY_FIELD;
		    msg = displayText + ' is required.';
		    
		  } else if (!Validator.isNull(fieldValue)) {
		    var cardAmericanExpress = /^(?:3[47][0-9]{13})$/;
		    var cardVisa            = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/;
		    var cardMaster          = /^(?:5[1-5][0-9]{14})$/;
		    fieldValue = fieldValue.replace(/ /g,'');
		    if (fieldValue.match(cardAmericanExpress)
		      || fieldValue.match(cardVisa)
		      || fieldValue.match(cardMaster)) {
		      //
		    } else {
		    	code = ErrorCodes.INVALID_CARD_NUMBER;
		      msg = displayText + ' is not valid format.';
		    }
		  }
		  return Validator.buildErrorObject(code, msg, fieldName);
		}
	};
}

Validator.ObjectRule = function(fieldName, displayText, required) {
	return {
		type: 'obj',
		field_name: fieldName,
		display_text: displayText,
		required: required,
		validate: function(fieldValue) {
			var msg = '';
			var code = '';
			if (fieldValue != undefined && typeof fieldValue != 'object') {
				code = ErrorCodes.INVALID_OBJECT;
				msg = displayText + ' is not an object.';

			} else if (required && fieldValue == undefined) {
				code = ErrorCodes.MANDATORY_FIELD;
				msg = displayText + ' is required.';
			}
			return Validator.buildErrorObject(code, msg, fieldName);
		}
	}
}

Validator.FunctionRule = function(functionName) {
	return {
		type: 'func',
		function_name: functionName,
		validate: function(params) {
			return functionName(params);
		}
	}
}

Validator.validate = function(obj, rules, returnAllErrors) {

	function getFieldValue(obj, fieldName) {
	  if (Validator.isString(fieldName)) {
	    return obj[fieldName];
	  } else if (Validator.isArray(fieldName)) {
	    var newObj = obj;
	    for (var i = 0; i < fieldName.length; i++) {
	      var fn = fieldName[i];
	      if (newObj) {
	        newObj = newObj[fn];
	      }
	      if ((i + 1) == fieldName.length) {
	        return newObj;
	      }
	    }
	  } else {
	    return undefined;
	  }
	}
	
	var errs = [];
	if (obj && rules) {
		var rules2;
		if (Validator.isArray(rules)) {
			rules2 = rules;
		} else {
			rules2 = [ rules ];
		}

		for (var i = 0; i < rules2.length; i++) {
			var rule = rules2[i];
			var err;
			
			switch (rule.type) {
				case 'number_range':
					err = rule.validate(getFieldValue(obj, rule.min_field_name), getFieldValue(obj, rule.max_field_name));
					break;

				case 'date_range':
					err = rule.validate(getFieldValue(obj, rule.min_field_name), getFieldValue(obj, rule.max_field_name));
					break;

				case 'func':
					err = rule.validate(obj);
					break;

				default:
					err = rule.validate(getFieldValue(obj, rule.field_name));
					break;
			}
			
			if (err && err.msg && err.msg.length > 0) {
		        errs.push(err);
		    }
		}
	}

	if (errs && errs.length == 0) {
		errs = undefined;
	}
	if (errs) {
		if (returnAllErrors == true) {
			return errs;
		} else {
			return errs[0];
		}
	}
	return undefined;
}


// Where it is used in browser or NodeJS
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Validator;
else
    window.Validator = Validator;
