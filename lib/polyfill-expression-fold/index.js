/**
 *
 * @param {Object} property
 * @param {String} property.type
 * @param {String} [property.value]
 * @param {String} [property.name]
 *
 * @returns {String|undefined}
 */
function propertyValue(property) {
    if (property.type === 'Identifier') {
        return property.name;
    } else if (property.type === 'Literal') {
        return property.value;
    }
}

/**
 * Folds simple MemberExpression chain or Identifier into list of properties
 *
 * @param {Object} ast
 * @returns {Array}
 */
module.exports = function (ast) {
    /* jshint maxstatements: 13 */
    var chain = [];
    while (ast) {
        if (ast.type === 'Identifier') {
            chain.unshift(ast.name);
            return chain;
        }
        if (ast.type !== 'MemberExpression') {
            return chain;
        }
        var value = propertyValue(ast.property);
        if (typeof value === 'undefined') {
            return chain;
        }
        chain.unshift(value);
        ast = ast.object;
    }
    return chain;
};
