var reBlock = require('kramed/lib/rules/block');
var markup = require('../../');
var utils = require('./utils');

// Rule for parsing code blocks
var blockRule = markup.Rule(markup.BLOCKS.CODE)
    .option('parseInline', false)

    // Currently causing problem since entities ar inlined
    .option('renderInline', false)

    // Fences
    .regExp(reBlock.gfm.fences, function(match) {
        return markup.EntityBlock(markup.BLOCKS.CODE, match[3], markup.Entity.MUTABLE, {
            syntax: match[2]
        });
    })

    // 4 spaces / Tab
    .regExp(reBlock.code, function(match) {
        var inner = match[0];
        var lines = utils.splitLines(inner);

        // Remove indentation
        inner = lines.map(function(line) {
            return line.replace(/^( {4}|\t)/, '');
        })
        .join('\n')
        .replace(/\s+$/g, '');

        return markup.EntityBlock(markup.BLOCKS.CODE, inner, markup.Entity.MUTABLE, {
            syntax: null
        });
    })

    // Output code blocks
    .toText(function(text) {
        return text + '\n\n';
    });


// Rule for rendering the code block entity
var blockEntityRule = markup.Rule(markup.BLOCKS.CODE)
    .option('parseInline', false)
    .option('renderInline', false)

    .toText(function(text, entity) {
        // Use fences if syntax is set
        if (entity.data.syntax) {
            return (
                '```'
                + entity.data.syntax
                + '\n'
                + text
                + '\n```'
            );
        }

        // Use four spaces otherwise
        var lines = utils.splitLines(text);

        return lines.map(function(line) {
            if (!line.trim()) return '';
            return '    ' + line;
        }).join('\n');
    });

module.exports = {
    block: blockRule,
    blockEntity: blockEntityRule
};
