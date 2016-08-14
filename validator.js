// TODO: define error code
// And validation error will be { code, name, field, msg } rather than only msg

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
  return nightsBetweenMoments(fromDateMoment, toDateMoment);
}

Validator.Date.nightsBetweenDateStrings = function(fromDateString, toDateString) {
  var fromDateMoment = moment(fromDateString, 'YYYY-MM-DD');
  var toDateMoment = moment(toDateString, 'YYYY-MM-DD');
  return nightsBetweenMoments(fromDateMoment, toDateMoment);
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
  return isSmallerDate(dateString, getTodayString());
}

Validator.Date.isPastOrNowDate = function(dateString) {
  return isSmallerOrEqualDate(dateString, getTodayString());
}

Validator.Date.isFutureDate = function(dateString) {
  return isSmallerDate(getTodayString(), dateString);
}

Validator.Date.isNowOrFutureDate = function(dateString) {
  return isSmallerOrEqualDate(getTodayString(), dateString);
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

Validator.ArrayRule = function(fieldName, displayText, required) {
	return {
		type: 'array',
		field_name: fieldName,
		display_text: displayText,
		required: required
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

Validator.validate = function(obj, rules) {

	// ++ Internal helper functions
	function isNull(myVar) {
		return (myVar == undefined || myVar.length == 0);
	}

	function validateString(fieldDisplayText, fieldValue, required, minLength, maxLength) {
	  var msg = '';
	  if (required) {
	    if (fieldValue == undefined || fieldValue.length == 0) {
	      msg = fieldDisplayText + ' is required.';
	    } else if (minLength && minLength > 0 && fieldValue.length < minLength) {
	      msg = 'Length of ' + fieldDisplayText + ' must be at least ' + minLength + ' char(s).';
	    } else if (maxLength && maxLength > 0 && fieldValue.length > maxLength) {
	      msg = 'Length of ' + fieldDisplayText + ' must not be greater than ' + maxLength + ' char(s).';
	    }
	  }
	  return msg;
	}

	function validateNumber(fieldDisplayText, fieldValue, required, minValue, maxValue) {
	  var msg = '';
	  if (required && (fieldValue == undefined || fieldValue.length == 0)) {
	    msg = fieldDisplayText + ' is required.';
	  } else if (fieldValue && fieldValue.length > 0) {
	    if (isNaN(fieldValue)) {
	      msg = fieldDisplayText + ' must be a number.';
	    } else {
	      var number = parseFloat(fieldValue);
	      if (minValue != undefined && number < minValue) {
	        msg = fieldDisplayText + ' must be at least ' + minValue + '.';
	      } else if (maxValue != undefined && number > maxValue) {
	        msg = fieldDisplayText + ' must not be greater than ' + maxValue + '.';
	      }
	    }
	  }
	  return msg;
	}

	function validateNumberRange(rangeDisplayText, minValue, maxValue) {
	  var msg = '';
	  if (minValue != undefined && maxValue != undefined && minValue > maxValue) {
	    msg = 'Min value of ' + rangeDisplayText + ' must not be greater than max value.';
	  }
	  return msg;
	}

	function validateDate(fieldDisplayText, fieldValue, required, minValue, maxValue) {
	  var msg = '';
	  if (fieldValue == undefined || fieldValue.length == 0) {
	    if (required) {
	      msg = fieldDisplayText + ' is required.';
	    }    
	  } else {
	  	var dateMoment = moment(fieldValue, 'YYYY-MM-DD');
	    if (!dateMoment.isValid()) {
	      msg = fieldDisplayText + ' is not valid.'
	    } else {
	    	if (minValue && Validator.Date.isSmallerDate(fieldValue, minValue)) {
	    		msg = fieldDisplayText + ' must not be smaller than ' + minValue;

	    	} else if (maxValue && Validator.Date.isSmallerDate(maxValue, fieldValue)) {
	    		msg = fieldDisplayText + ' must not be greater than ' + maxValue;
	    	}
	    }
	  }
	  return msg;
	}

	function validateDateRange(rangeDisplayText, minValue, maxValue) {
	  var msg = '';
	  if (Validator.Date.isSmallerDate(maxValue, minValue)) {
	  	msg = 'Min date of ' + rangeDisplayText + ' must not be greater than max date.';
	  }
	  return msg;
	}

	function validateBoolean(fieldDisplayText, fieldValue) {
	  var msg = '';
	  if (isNull(fieldValue)) {
	    msg = fieldDisplayText + ' is required.';
	  }
	  return msg;
	}

	function validateArray(fieldDisplayText, fieldValue, required) {
	  var msg = '';
	  if (required) {
	    if (fieldValue == undefined || Array.isArray(fieldValue) == false || fieldValue.length == 0) {
	      msg = fieldDisplayText + ' is required.';
	    }
	  }
	  return msg;
	}

	function validateCreditCardNumber(fieldDisplayText, fieldValue, required) {
	  var msg = '';
	  if (required && isNull(fieldValue)) {
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
	      msg = fieldDisplayText + ' is not valid format.';
	    }
	  }
	  return msg;
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

	var msg = '';
	if (obj && rules && Array.isArray(rules) && rules.length > 0) {
		for (var i = 0; i < rules.length; i++) {
			var rule = rules[i];
			var displayText = rule.display_text;
			
			switch (rule.type) {
				case 'string':
					msg = validateString(displayText, getFieldValue(obj, rule.field_name), rule.required, rule.min_length, rule.max_length);
					break;

				case 'number':
					msg = validateNumber(displayText, getFieldValue(obj, rule.field_name), rule.required, rule.min_value, rule.max_value);
					break;

				case 'number_range':
					msg = validateNumberRange(displayText, getFieldValue(obj, rule.min_field_name), getFieldValue(obj, rule.max_field_name));
					break;

				case 'date':
					msg = validateDate(displayText, getFieldValue(obj, rule.field_name), rule.required, rule.min_value, rule.max_value);
					break;

				case 'date_range':
					break;

				case 'bool':
					msg = validateBoolean(displayText, getFieldValue(obj, rule.field_name));
					break;

				case 'array':
					msg = validateArray(displayText, getFieldValue(obj, rule.field_name), rule.required);
					break;

				case 'credit':
					msg = validateCreditCardNumber(displayText, getFieldValue(obj, rule.field_name), rule.required);
					break;

				case 'func':
					msg = validateByFunction(rule.function_name, obj);
					break;

				default:
					break;
			}
			if (msg && msg.length > 0) {
		        break;
		    }
		}
	}
	return msg;
}


// Where it is used in browser or NodeJS
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Validator;
else
    window.Validator = Validator;
