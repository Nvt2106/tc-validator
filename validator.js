'use strict';

if (typeof require !== 'undefined') {
	var moment = require('moment');
}

var Validator = Validator || {};

Validator.isNumber = function(myVar) {
    return !isNaN(myVar)
}

Validator.isString = function(myVar) {
	return (typeof myVar === 'string' || myVar instanceof String);
}

Validator.isArray = function(myVar) {
	return Array.isArray(myVar);
}

Validator.Date = Validator.Date || {};

Validator.Date.getFormattedDate = function(date) {
  var m_names = new Array("Jan", "Feb", "Mar", 
    "Apr", "May", "Jun", "Jul", "Aug", "Sep", 
    "Oct", "Nov", "Dec");
  var year = date.getFullYear();
  var month = (1 + date.getMonth());
  var day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  return day + '-' + m_names[month] + '-' + year;
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

Validator.Date.nightsBetweenMoments = function(fromDateMoment, toDateMoment) {
  return toDateMoment.diff(fromDateMoment, 'days');
}

Validator.Date.nightsBetweenDates = function(fromDate, toDate) {
  var fromDateMoment = moment(fromDate);
  var toDateMoment = moment(toDate);
  return Validator.Date.nightsBetweenMoments(fromDateMoment, toDateMoment);
}

Validator.Date.nightsBetweenDateStrings = function(fromDateString, toDateString) {
  var fromDateMoment = moment(fromDateString, 'YYYY-MM-DD');
  var toDateMoment = moment(toDateString, 'YYYY-MM-DD');
  return Validator.Date.nightsBetweenMoments(fromDateMoment, toDateMoment);
}

Validator.Date.getTodayString = function() {
  var today = new Date();
  return today.getFullYear() + '-' + (1 + today.getMonth()) + '-' + today.getDate();
}

Validator.Date.isSmallerDate = function(dateString, anotherDateString) {
  var dateMoment = moment(dateString, 'YYYY-MM-DD');
  var anotherDateMoment = moment(anotherDateString, 'YYYY-MM-DD');
  return (dateMoment.diff(anotherDateMoment) < 0);
}

Validator.Date.isSmallerOrEqualDate = function(dateString, anotherDateString) {
  var dateMoment = moment(dateString, 'YYYY-MM-DD');
  var anotherDateMoment = moment(anotherDateString, 'YYYY-MM-DD');
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

Validator.Date.getDateString = function(dateTimeString) {
  if (dateTimeString) {
    return (dateTimeString.substring(0, 10));
  }
  return undefined;
}


Validator.StringRule = function(fieldName, displayText, required, minLength, maxLength) {
	return {
		type: 'string',
		field_name: fieldName,
		display_text: displayText,
		required: required,
		min_length: minLength,
		max_length: maxLength
	};
}

Validator.NumberRule = function(fieldName, displayText, required, minValue, maxValue) {
	return {
		type: 'number',
		field_name: fieldName,
		display_text: displayText,
		required: required,
		min_value: minValue,
		max_value: maxValue
	};
}

Validator.NumberRangeRule = function(minFieldName, maxFieldName, displayText) {
	return {
		type: 'number_range',
		min_field_name: minFieldName,
		max_field_name: maxFieldName,
		display_text: displayText
	};
}

Validator.DateRule = function(fieldName, displayText, required, minValue, maxValue) {
	return {
		type: 'date',
		field_name: fieldName,
		display_text: displayText,
		required: required,
		min_value: minValue,
		max_value: maxValue
	};
}

Validator.DateRangeRule = function(minFieldName, maxFieldName, displayText) {
	return {
		type: 'date_range',
		min_field_name: minFieldName,
		max_field_name: maxFieldName,
		display_text: displayText
	};
}

Validator.BooleanRule = function(fieldName, displayText) {
	return {
		type: 'bool',
		field_name: fieldName,
		display_text: displayText
	};
}

Validator.ArrayRule = function(fieldName, displayText, required, minLength, maxLength) {
	return {
		type: 'array',
		field_name: fieldName,
		display_text: displayText,
		required: required,
		min_length: minLength,
		max_length: maxLength
	};
}

Validator.CreditCardNumberRule = function(fieldName, displayText, required) {
	return {
		type: 'credit',
		field_name: fieldName,
		display_text: displayText,
		required: required
	};
}

Validator.FunctionRule = function(functionName) {
	return {
		type: 'func',
		function_name: functionName
	}
}

// ++ Error code
var ErrorCodes = {
	UNKNOWN:           		1000,
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
	INVALID_ARRAY:          1011
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

Validator.validate = function(obj, rules) {

	// ++ Internal helper functions
	function isNull(myVar) {
		return (myVar == undefined || myVar.length == 0);
	}

	function validateString(fieldDisplayText, fieldValue, required, minLength, maxLength) {
	  var msg = '';
	  var code = '';
	  if (required) {
	    if (fieldValue == undefined || fieldValue.length == 0) {
	      code = ErrorCodes.MANDATORY_FIELD;
	      msg = fieldDisplayText + ' is required.';

	    } else if (minLength && minLength > 0 && fieldValue.length < minLength) {
	      code = ErrorCodes.MIN_LENGTH_VIOLATED;
	      msg = 'Length of ' + fieldDisplayText + ' must be at least ' + minLength + ' char(s).';

	    } else if (maxLength && maxLength > 0 && fieldValue.length > maxLength) {
	      code = ErrorCodes.MAX_LENGTH_VIOLATED;
	      msg = 'Length of ' + fieldDisplayText + ' must not be greater than ' + maxLength + ' char(s).';
	    }
	  }
	  return Validator.buildErrorObject(code, msg);
	}

	function validateNumber(fieldDisplayText, fieldValue, required, minValue, maxValue) {
	  var msg = '';
	  var code = '';
	  if (required && (fieldValue == undefined || fieldValue.length == 0)) {
	  	code = ErrorCodes.MANDATORY_FIELD;
	    msg = fieldDisplayText + ' is required.';

	  } else if (fieldValue && fieldValue.length > 0) {
	    if (isNaN(fieldValue)) {
	    	code = ErrorCodes.INVALID_NUMBER;
	    	msg = fieldDisplayText + ' is not a valid number.';

	    } else {
	      var number = parseFloat(fieldValue);
	      if (minValue != undefined && number < minValue) {
	      	code = ErrorCodes.MIN_VALUE_VIOLATED;
	        msg = fieldDisplayText + ' must be at least ' + minValue + '.';

	      } else if (maxValue != undefined && number > maxValue) {
	      	code = ErrorCodes.MAX_VALUE_VIOLATED;
	        msg = fieldDisplayText + ' must not be greater than ' + maxValue + '.';
	      }
	    }
	  }
	  return Validator.buildErrorObject(code, msg);
	}

	function validateNumberRange(rangeDisplayText, minValue, maxValue) {
	  var msg = '';
	  var code = '';
	  if (minValue != undefined && maxValue != undefined && minValue > maxValue) {
	  	code = ErrorCodes.INVALID_NUMBER_RANGE;
	    msg = 'Min value of ' + rangeDisplayText + ' must not be greater than max value.';
	  }
	  return Validator.buildErrorObject(code, msg);
	}

	function validateDate(fieldDisplayText, fieldValue, required, minValue, maxValue) {
	  var msg = '';
	  var code = '';
	  if (fieldValue == undefined || fieldValue.length == 0) {
	    if (required) {
	    	code = ErrorCodes.MANDATORY_FIELD;
	      msg = fieldDisplayText + ' is required.';
	    }    
	  } else {
	  	var dateMoment = moment(fieldValue, 'YYYY-MM-DD');
	    if (!dateMoment.isValid()) {
	    	code = ErrorCodes.INVALID_DATE;
	      msg = fieldDisplayText + ' is not a valid date.'

	    } else {
	    	if (minValue && Validator.Date.isSmallerDate(fieldValue, minValue)) {
	    		code = ErrorCodes.MIN_VALUE_VIOLATED;
	    		msg = fieldDisplayText + ' must not be smaller than ' + minValue;

	    	} else if (maxValue && Validator.Date.isSmallerDate(maxValue, fieldValue)) {
	    		code = ErrorCodes.MAX_VALUE_VIOLATED;
	    		msg = fieldDisplayText + ' must not be greater than ' + maxValue;
	    	}
	    }
	  }
	  return Validator.buildErrorObject(code, msg);
	}

	function validateDateRange(rangeDisplayText, minValue, maxValue) {
	  var msg = '';
	  var code = '';
	  if (Validator.Date.isSmallerDate(maxValue, minValue)) {
	  	code = ErrorCodes.INVALID_DATE_RANGE;
	  	msg = rangeDisplayText;
	  }
	  return Validator.buildErrorObject(code, msg);
	}

	function validateBoolean(fieldDisplayText, fieldValue) {
	  var msg = '';
	  var code = '';
	  if (isNull(fieldValue)) {
	  	code = ErrorCodes.MANDATORY_FIELD;
	    msg = fieldDisplayText + ' is required.';
	  }
	  return Validator.buildErrorObject(code, msg);
	}

	function validateArray(fieldDisplayText, fieldValue, required, minLength, maxLength) {
		var msg = '';
		var code = '';
		if (fieldValue != undefined && Array.isArray(fieldValue) == false) {
			code = ErrorCodes.INVALID_ARRAY;
			msg = fieldDisplayText + ' is not a valid array.';
		} else if (required) {
			if (fieldValue == undefined) {
				code = ErrorCodes.MANDATORY_FIELD;
				msg = fieldDisplayText + ' is required.';
			} else if (minLength != undefined && fieldValue.length < minLength) {
				code = ErrorCodes.MIN_LENGTH_VIOLATED;
				msg = 'Length of ' + fieldDisplayText + ' must be at least ' + minLength + ' element(s).';
			} else if (maxLength != undefined && fieldValue.length > maxLength) {
				code = ErrorCodes.MAX_LENGTH_VIOLATED;
				msg = 'Length of ' + fieldDisplayText + ' must not be more than ' + maxLength + ' element(s).';
			}
		}
		return Validator.buildErrorObject(code, msg);
	}

	function validateCreditCardNumber(fieldDisplayText, fieldValue, required) {
	  var msg = '';
	  var code = '';
	  if (required && isNull(fieldValue)) {
	  	code = ErrorCodes.MANDATORY_FIELD;
	    msg = fieldDisplayText + ' is required.';
	  }
	  if (isNull(msg) && !isNull(fieldValue)) {
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
	      msg = fieldDisplayText + ' is not valid format.';
	    }
	  }
	  return Validator.buildErrorObject(code, msg);
	}

	function validateByFunction(functionName, params) {
		return functionName(params);	  	
	}

	function getFieldValue(obj, fieldName) {
	  if (Validator.isString(fieldName)) {
	    return obj[fieldName];
	  } else if (Array.isArray(fieldName)) {
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
	// -- Internal helper functions

	var err = {};
	if (obj && rules && Array.isArray(rules) && rules.length > 0) {
		for (var i = 0; i < rules.length; i++) {
			var rule = rules[i];
			var displayText = rule.display_text;
			
			switch (rule.type) {
				case 'string':
					err = validateString(displayText, getFieldValue(obj, rule.field_name), rule.required, rule.min_length, rule.max_length);
					err.field_name = rule.field_name;
					break;

				case 'number':
					err = validateNumber(displayText, getFieldValue(obj, rule.field_name), rule.required, rule.min_value, rule.max_value);
					err.field_name = rule.field_name;
					break;

				case 'number_range':
					err = validateNumberRange(displayText, getFieldValue(obj, rule.min_field_name), getFieldValue(obj, rule.max_field_name));
					break;

				case 'date':
					err = validateDate(displayText, getFieldValue(obj, rule.field_name), rule.required, rule.min_value, rule.max_value);
					err.field_name = rule.field_name;
					break;

				case 'date_range':
					err = validateDateRange(displayText, getFieldValue(obj, rule.min_field_name), getFieldValue(obj, rule.max_field_name));
					break;

				case 'bool':
					err = validateBoolean(displayText, getFieldValue(obj, rule.field_name));
					err.field_name = rule.field_name;
					break;

				case 'array':
					err = validateArray(displayText, getFieldValue(obj, rule.field_name), rule.required, rule.min_length, rule.max_length);
					err.field_name = rule.field_name;
					break;

				case 'credit':
					err = validateCreditCardNumber(displayText, getFieldValue(obj, rule.field_name), rule.required);
					err.field_name = rule.field_name;
					break;

				case 'func':
					err = validateByFunction(rule.function_name, obj);
					break;

				default:
					break;
			}
			if (err && err.msg && err.msg.length > 0) {
		        break;
		    }
		}
	}
	
	if (err && err.msg && err.msg.length > 0) {
		console.log(err);
		return err;
	}
	return undefined;
}


// Where it is used in browser or NodeJS
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Validator;
else
    window.Validator = Validator;
