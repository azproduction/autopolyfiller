var quotemeta = require('quotemeta');

var functionMethods = ['call', 'apply', 'bind'];
var padding = ['window', 'this'];
var propertySeparator = quotemeta('.');

var types = {
    /**
     *
     * @param {Object}   options
     * @param {Object}   options.objects
     *
     * @example
     *
     * var matcher = static({
     *     objects: {
     *         'Object': ['keys', 'assign']
     *     }
     * });
     *
     * matcher('this.Object.keys.apply.call()'); // 'Object.keys'
     *
     * @returns {Function}
     */
    'static': function (options) {
        var objects = options.objects || {};

        var methods = Object.keys(objects).map(function (object) {
            return object + propertySeparator + '(?:' + objects[object].join('|') + ')';
        });

        var rx = new RegExp(
            '^' +
            '(?:(?:' + padding.join('|') + ')' + propertySeparator + ')?' +
            '(' + methods.join('|') + ')' +
            '(?:' + propertySeparator + '(?:' + functionMethods.join('|') + '))*' +
            '$'
        );

        /**
         * @param {String} code
         * @returns {String}
         */
        return function (code) {
            return (code.match(rx) || 0)[1];
        };
    },
    /**
     *
     * @param {Object}   options
     * @param {Object}   options.methods
     *
     * @example
     *
     * var matcher = static({
     *     methods: ['every']
     * });
     *
     * matcher('this.array.every.apply.call'); // 'every'
     *
     * @returns {Function}
     */
    'method': function (options) {
        var methods = options.methods || [];

        var rx = new RegExp(
            '^' +
            '(?:[^' + propertySeparator + ']*' + propertySeparator + ')*' +
            '(' + methods.join('|') + ')' +
            '(?:' + propertySeparator + '(?:' + functionMethods.join('|') + '))*' +
            '$'
        );

        /**
         * @param {String} code
         * @returns {String}
         */
        return function (code) {
            return (code.match(rx) || 0)[1];
        };
    },

    /**
     *
     * @param {Object}   options
     * @param {Object}   options.methods
     *
     * @example
     *
     * var matcher = static({
     *     methods: ['atob']
     * });
     *
     * matcher('this.atob()'); // 'atob'
     * matcher('atob()'); // 'atob'
     *
     * @returns {Function}
     */
    'global': function (options) {
        var methods = options.methods || [];

        var rx = new RegExp(
            '^' +
            '(?:(?:' + padding.join('|') + ')' + propertySeparator + ')?' +
            '(' + methods.join('|') + ')' +
            '(?:' + propertySeparator + '(?:' + functionMethods.join('|') + '))*' +
            '$'
        );

        /**
         * @param {String} code
         * @returns {String}
         */
        return function (code) {
            return (code.match(rx) || 0)[1];
        };
    },

    /**
     *
     * @param {Object}   options
     * @param {Object}   options.constructors
     *
     * @example
     *
     * var matcher = static({
     *     constructors: ['Map']
     * });
     *
     * matcher('new Map()'); // 'Map'
     * matcher('new window.Map()'); // 'Map'
     *
     * @returns {Function}
     */
    'constructor': function (options) {
        var constructors = options.constructors || [];

        var rx = new RegExp(
            '^' +
            '(?:(?:' + padding.join('|') + ')' + propertySeparator + ')?' +
            '(' + constructors.join('|') + ')' +
            '$'
        );

        /**
         * @param {String} code
         * @returns {String}
         */
        return function (code) {
            return (code.match(rx) || 0)[1];
        };
    }
};

module.exports = function (type, options) {
    return types[type](options);
};
