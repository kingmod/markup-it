var reInline = require('kramed/lib/rules/inline');
var markup = require('../../');

var utils = require('./utils');
var code = require('./code');

module.exports = [
    // ---- ESCAPED ----
    markup.Rule(markup.INLINES.TEXT)
        .option('parseInline', false)
        .regExp(reInline.escape, function(match) {
            return {
                text: utils.unescape(match[0])
            };
        })
        .toText(utils.escape),

    // ---- FOOTNOTE REFS ----
    markup.Rule(markup.INLINES.FOOTNOTE_REF)
        .regExp(reInline.reffn, function(match) {
            return {
                mutability: 'MUTABLE',
                text: match[1],
                data: {}
            };
        })
        .toText(function(text) {
            return '[^' + text + ']';
        }),

    // ---- IMAGES ----
    markup.Rule(markup.INLINES.IMAGE)
        .regExp(reInline.link, function(match) {
            var isImage = match[0].charAt(0) === '!';
            if (!isImage) return null;

            return {
                mutability: 'IMMUTABLE',
                text: match[1],
                data: {
                    title: match[1],
                    src: match[2]
                }
            };
        })
        .toText(function(text, entity) {
            return '![' + text + '](' + entity.data.src + ')';
        }),

    // ---- LINK----
    markup.Rule(markup.INLINES.LINK)
        .regExp(reInline.link, function(match) {
            return {
                mutability: 'MUTABLE',
                text: match[1],
                data: {
                    href: match[2],
                    title: match[3]
                }
            };
        })
        .toText(function(text, entity) {
            var title = entity.data.title? ' "' + entity.data.title + '"' : '';
            return '[' + text + '](' + entity.data.href + title + ')';
        }),

    // ---- REF LINKS ----
    // Doesn't render, but match and resolve reference
    markup.Rule(markup.INLINES.LINK_REF)
        .regExp(reInline.reflink, function(match) {
            return {
                mutability: 'MUTABLE',
                text: match[1],
                data: {
                    ref: match[2]
                }
            };
        })
        .finish(function(text, entity) {
            var refs = (this.refs || {});
            var refId = entity.data.ref;
            var ref = refs[refId];

            entity.type = markup.INLINES.LINK;
            entity.data = ref || { href: refId };

            return entity;
        })
        .toText(function(text, entity) {
            var title = entity.data.title? ' "' + entity.data.title + '"' : '';
            return '[' + text + '](' + entity.data.href + title + ')';
        }),

    // ---- CODE ----
    markup.Rule(markup.INLINES.CODE)
        .option('parseInline', false)
        .regExp(reInline.code, function(match) {
            return {
                text: match[2]
            };
        })
        .toText('`%s`'),

    // ---- BOLD ----
    markup.Rule(markup.INLINES.BOLD)
        .regExp(reInline.strong, function(match) {
            return {
                text: match[2]
            };
        })
        .toText('**%s**'),

    // ---- ITALIC ----
    markup.Rule(markup.INLINES.ITALIC)
        .regExp(reInline.em, function(match) {
            return {
                text: match[1]
            };
        })
        .toText('_%s_'),

    // ---- STRIKETHROUGH ----
    markup.Rule(markup.INLINES.STRIKETHROUGH)
        .regExp(reInline.gfm.del, function(match) {
            return {
                text: match[1]
            };
        })
        .toText('~~%s~~'),

    // ---- TEXT ----
    markup.Rule(markup.INLINES.TEXT)
        .option('parseInline', false)
        .regExp(reInline.gfm.text, function(match) {
            return {
                text: utils.unescape(match[0])
            };
        })
        .toText(utils.escape),

    // ---- BLOCK ENTITIES ----
    // Footnotes and defs are parsed as block with an inner entity
    // these rules define the toText of the inner entities
    markup.Rule(markup.BLOCKS.FOOTNOTE)
        .toText(function(text, entity) {
            return '[^' + entity.data.id + ']: ' + text;
        }),
    markup.Rule(markup.BLOCKS.DEFINITION)
        .toText(function(text, entity) {
            var title = entity.data.title? (' "' + entity.data.title + '"') : '';
            return '[' + entity.data.id + ']: ' + text + title;
        }),

    code.blockEntity,

    // ---- HEADING ID ----
    markup.Rule(markup.INLINES.HEADING_ID)
        .toText(function(text, entity) {
            if (!entity.data.id) return '';
            return '{#' + entity.data.id + '}';
        }),

    // ---- TABLE ----
    markup.Rule(markup.INLINES.TABLE_HEADER)
        .toText(function(text, entity) {
            var align = entity.data.align;

            return align.reduce(function(align) {
                if (align == 'right') {
                    return '---: |';
                } else if (align == 'left') {
                    return ':--- |';
                } else if (align == 'center') {
                    return ':---: |';
                } else  {
                    return '--- |';
                }
            }, text + '\n|');
        }),
    markup.Rule(markup.INLINES.TABLE_BODY)
        .toText('%s'),
    markup.Rule(markup.INLINES.TABLE_ROW)
        .toText('| %s\n'),
    markup.Rule(markup.INLINES.TABLE_CELL)
        .toText('%s |'),
];
