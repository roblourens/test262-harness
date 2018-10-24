module.exports = function({
    types: t
}) {
    return {
        visitor: {
            RegExpLiteral(path) {
                path.replaceWith(
                    t.newExpression(t.identifier('RegExp'), [t.stringLiteral(path.node.pattern)])
                )
            }
        }
    };
};