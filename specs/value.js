var expect = require('chai').expect;
var itDepends = require('../src/it-depends.js').itDepends;

describe('value', function () {
	it('should store initial value', function () {
		var value = itDepends.value('Bob');
		
		expect(value()).to.equal('Bob');
	});
	
	it('should support undefined initial value', function () {
		var value = itDepends.value();
		
		expect(value()).to.be.undefined;
	});
	
	it('should change value after calling write as a method', function () {
		var value = itDepends.value('Bob');
		
		value.write('Jack');
		
		expect(value()).to.equal('Jack');
	});
	
	it('should change value after calling write as a separate function', function () {
		var value = itDepends.value('Bob');
		
		var writer = value.write;
		
		writer('Jack');
		
		expect(value()).to.equal('Jack');
	});
});
