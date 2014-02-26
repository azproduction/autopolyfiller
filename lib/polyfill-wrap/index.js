/**
 * Wraps code with conditional expression
 *
 * @param {string} code
 * @param {string} conditionExpression
 * @returns {string}
 */
function wrap(code, conditionExpression) {
    return 'if (' + conditionExpression + ') {\n' + code + '\n}\n';
}

module.exports = wrap;
