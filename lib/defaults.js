var Rule = require('./rule');

var BLOCKS = require('./blocks');
var INLINES = require('./inlines');

var defaultBlockRule = Rule(BLOCKS.PARAGRAPH)
    .toText('%s');

var defaultInlineRule = Rule(INLINES.TEXT)
    .option('parseInline', false)
    .toText('%s');

module.exports = {
    blockRule: defaultBlockRule,
    inlineRule: defaultInlineRule
};