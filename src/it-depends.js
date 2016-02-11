'use strict';
/*!
* it-depends - v{{ version }}
* https://github.com/gerich-home/itDepends
* Copyright (c) 2016 Sergey Gerasimov; Licensed MSPL
*
* Lightweight dependency tracking library for JavaScript
*/
(function (rootObject, factory) {
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // CommonJS or Node
        factory(exports);
    } else if (typeof define === 'function' && define['amd']) {
        // AMD anonymous module
        define([], factory);
    } else {
        // <script> tag: define the global `itDepends` object
        var exports = {};
        factory(exports);
        rootObject.itDepends = exports;
    }
}(this, function (exports) {
    var nop = function () { };
    var trackers = [nop];
    var nextId = 0;
    var dependencyLookup = {};

    function createDependency(id) {
        dependencyLookup[id] = {
            needsRecalc: false,
            dependents: {}
        };
    };

    function forEach(values, iterator) {
        for (var key in values) {
            if (!values.hasOwnProperty(key))
                continue;

            iterator(key, values[key]);
        }
    };

    function setChanged(id) {
        var dependency = dependencyLookup[id];
        if (dependency.needsRecalc) {
            return;
        }

        dependency.needsRecalc = true;

        forEach(dependency.dependents, setChanged);

        dependency.dependents = {};
    };

    function notifyCurrentTracker(id) {
        trackers[trackers.length - 1](id);
    };

    exports.value = function (initialValue) {
        var currentValue = initialValue;
        var id = ++nextId;
        createDependency(id);

        var self = function () {
            notifyCurrentTracker(id);
            return currentValue;
        };

        self.write = function (newValue) {
            if (currentValue !== newValue) {
                currentValue = newValue;
                setChanged(id);
                dependencyLookup[id].needsRecalc = false;
            }
        };

        return self;
    };

    exports.computed = function (calculator) {
        var dependencies;
        var currentValue;
        var id = ++nextId;
        createDependency(id);
        dependencyLookup[id].needsRecalc = true;

        var self = function () {
            var dependency = dependencyLookup[id];
            if (dependency.needsRecalc) {
                dependency.needsRecalc = false;

                if (dependencies) {
                    forEach(dependencies, function(dependencyId) {
                        if (dependencies.hasOwnProperty[dependencyId]) {
                            delete dependencyLookup[dependencyId].dependents[id];
                        }
                    });
                }

                dependencies = {};

                trackers.push(function (dependencyId) {
                    if (dependencies.hasOwnProperty[dependencyId])
                        return;

                    dependencies[dependencyId] = true;
                    dependencyLookup[dependencyId].dependents[id] = true;
                });

                try {
                    currentValue = calculator();
                } finally {
                    trackers.pop();
                }
            }

            notifyCurrentTracker(id);

            return currentValue;
        };

        return self;
    };

    exports.promiseValue = function (promise, initialValue) {
        var currentValue = exports.value(initialValue);

        promise.then(currentValue.write);

        return exports.computed(currentValue);
    };
}));