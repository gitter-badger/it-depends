var Benchmark = require('benchmark');
var itDepends = require('../../out/dist/it-depends.js');
var ko = require('knockout');

var initialValue = -1;

function _noop() {
	return function() {};
};

var calculator = function() {
	return 0;
};

module.exports = function(updatesCount, subscribersCount) {
	
	var testContext;
	
	global.createTestContext = function() {
		function koData() {
			var observable = ko.observable(initialValue);
			var computed = ko.computed(calculator);

			var subscriptions = [];
			for(var i = 0; i < subscribersCount; ++i) {
				subscriptions.push(computed.subscribe(_noop()));
			}
			
			return {
				observable: observable,
				subscriptions: subscriptions,
				disposeSubscription: function(subscription) {
					subscription.dispose();
				}
			};
		};
		
		function itDependsData() {
			var observable = itDepends.value(initialValue);
			var computed = itDepends.computed(calculator);

			var subscriptions = [];
			for(var i = 0; i < subscribersCount; ++i) {
				subscriptions.push(computed.onChange(_noop()));
			}
			
			return {
				observable: observable,
				subscriptions: subscriptions,
				disposeSubscription: function(subscription) {
					subscription.disable();
				}
			};
		};
			
		function disposeSubscriptions(source) {
			for(var i = 0; i < subscribersCount; ++i) {
				source.disposeSubscription(source.subscriptions[i]);
			}
		};
		
		testContext = {
			ko: koData(),
			itDepends: itDependsData(),
			
			tearDown: function() {
				disposeSubscriptions(this.ko);
				disposeSubscriptions(this.itDepends);
			}
		};
	};
	
	global.tearDownContext = function() {
		testContext.tearDown();
	};
	
	Benchmark.prototype.setup = function() {
		global.createTestContext();
	};
	
	Benchmark.prototype.teardown = function() {
		global.tearDownContext();
	};
	
	var suite = new Benchmark.Suite('computed updated ' + updatesCount + ' times with ' + subscribersCount + ' subscribers');

	suite.add('knockout', function() {
		for (var i = 0; i < updatesCount; i++) {
			testContext.ko.observable(i);
		}
	});

	suite.add('itDepends', function() {
		for (var i = 0; i < updatesCount; i++) {
			testContext.itDepends.observable.write(i);
		}
	});
	
	return suite;
};