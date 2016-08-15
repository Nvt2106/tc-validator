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