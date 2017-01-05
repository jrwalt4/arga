var jasmine = new (require('jasmine'))();

jasmine.loadConfigFile('./spec/support/jasmine.json');

jasmine.execute();