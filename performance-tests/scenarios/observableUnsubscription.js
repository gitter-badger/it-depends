var Benchmark = require('benchmark');
var itDepends = require('../../out/dist/it-depends.js');
var ko = require('knockout');

module.exports = function(subscribersCount) {
	Benchmark.prototype.args = {
		subscribersCount: subscribersCount,
		ko: ko,
		itDepends: itDepends
	};

	Benchmark.prototype.setup = function() {
		var subscribersCount = this.args.subscribersCount;
		var ko = this.args.ko;
		var itDepends = this.args.itDepends;

		var initialValue = -1;

		function _noop() {
			return function() {};
		};
	};

	var suite = new Benchmark.Suite('unsubscribe from observable with ' + subscribersCount + ' subscribers');

	suite.add('knockout', function() {
		var observable = ko.observable(initialValue);
		var subscriptions = [];
		
		for (var i = 0; i < subscribersCount; i++) {
			subscriptions.push(observable.subscribe(_noop()));
		}
		
		for (var i = 0; i < subscribersCount; i++) {
			subscriptions[i].dispose();
		}
	});

	suite.add('itDepends', function() {
		var observable = itDepends.value(initialValue);
		var subscriptions = [];
		
		for (var i = 0; i < subscribersCount; i++) {
			subscriptions.push(observable.onChange(_noop()));
		}
		
		for (var i = 0; i < subscribersCount; i++) {
			subscriptions[i].disable();
		}
	});

	return suite;
};