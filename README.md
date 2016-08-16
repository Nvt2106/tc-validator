# tc-validator
Validate a value or an object.


# Install
npm install tc-validator


# Usage
### Load Validator
var Validator = require('tc-validator');

### Define validation rules
var rules = [];
// Field name 'first_name' must be required, and have from 3 to 255 chars.

rules.push(new Validator.StringRule('first_name', 'First Name', true, 3, 255));


### Validate and get back err object (null if validation is passed)
var obj = { first_name: '' };

var err = Validator.validate(obj, rules); // err.msg = First Name is required


obj = { first_name: 'A' };

err = Validator.validate(obj, rules); // err.msg = Length of First Name must be at least 3 char(s)


# Rules
Validator.StringRule = function(fieldName, displayText, required, minLength, maxLength)

Validator.NumberRule = function(fieldName, displayText, required, minValue, maxValue)

Validator.NumberRangeRule = function(minFieldName, maxFieldName, displayText)

Validator.DateRule = function(fieldName, displayText, required, minValue, maxValue)

Validator.DateRangeRule = function(minFieldName, maxFieldName, displayText)

Validator.BooleanRule = function(fieldName, displayText)

Validator.ArrayRule = function(fieldName, displayText, required)

Validator.CreditCardNumberRule = function(fieldName, displayText, required)

Validator.FunctionRule = function(functionObj) // functionObj takes object data as param and return { code, msg, field_name }


# Error Codes
Validator.ErrorCodes = {

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

	INVALID_ARRAY:          1011
	
};
