var path = require('path');
var jasmine = new (require('jasmine'))();

jasmine.loadConfigFile(path.resolve(__dirname, '../src/spec/support/jasmine.json'));

jasmine.execute();