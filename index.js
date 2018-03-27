const dox = require('dox');

/**
 * Format string as name.
 *
 * @example formatStringForName('module.exports.parser');
 * @param {String} contents String to format.
 * @return {String} Formatted string.
 * @private
 */

const formatStringForName = content =>
    content.toString()
        .replace(/module\.exports\.|\.prototype|\(\)/g, '');

/**
 * Format string as param.
 *
 * @example formatStringForParam('[optional param]');
 * @param {String} contents String to format.
 * @return {String} Formatted string.
 * @private
 */

const formatStringForParam = content =>
    content.toString()
        .replace(/\[|\]/g, '');

/**
 * Format string as UID.
 *
 * @example formatStringForUID('example string');
 * @param {String} contents String to format.
 * @return {String} Formatted string.
 * @private
 */

const formatStringForUID = content =>
    content.toString()
        .toLowerCase()
        .replace(/[^\w\.]+/g, '-')
        .replace(/^-|-$/g, '');

/**
* Custom parser for doxdox based on slate tag template.
*/

const parser = (content, filename) =>
    dox.parseComments(content, {
        'raw': true,
        'skipSingleStar': true
    }).filter(method => !method.ignore && method.ctx)
        .map(method => ({
            'uid': formatStringForUID(`${filename}-${method.ctx.string}`),
            'isPrivate': method.isPrivate,
            'type': method.ctx.type,
            'name': formatStringForName(method.ctx.string),
            'description': method.description.full,
            'empty': !method.description.full && !method.tags.length,
            'params': method.tags.filter(tag =>
                tag.type === 'param' && !tag.name.match(/\./))
                .map(tag => {

                    if (tag.optional) {

                        return `[${formatStringForParam(tag.name)}]`;

                    }

                    return formatStringForParam(tag.name);

                })
                .join(', ')
                .replace(/\], \[/g, ', ')
                .replace(', [', '[, '),
            'tags': {
				'summary': method.tags.filter(tag => tag.type === 'summary')
                    .map(tag => tag.string),
				'sourcecode': method.tags.filter(tag => tag.type === 'sourcecode')
                    .map(tag => ({
                        'name': tag.name,
                        'description': tag.description
                    })),
				'invocation': method.tags.filter(tag => tag.type === 'invocation')
                    .map(tag => ({
                        'name': tag.name,
                        'description': tag.description
                    })),
                'param': method.tags.filter(tag => tag.type === 'param')
                    .map(tag => ({
                        'name': formatStringForParam(tag.name),
                        'isOptional': tag.optional,
                        'types': tag.types,
                        'description': tag.description
                    })),
                'snsoutput': method.tags.filter(tag => tag.type === 'snsoutput')
                    .map(tag => ({
                        'name': tag.name,
                        'description': tag.description
                    })),
				'property': method.tags.filter(tag => tag.type === 'property')
                    .map(tag => ({
                        'name': formatStringForParam(tag.name),
                        'types': tag.types,
                        'description': tag.description
                    })),
				's3objectpath': method.tags.filter(tag => tag.type === 's3objectpath')
                    .map(tag => ({
                        'name': tag.name,
                        'description': tag.description
                    })),
				'gdrive': method.tags.filter(tag => tag.type === 'gdrive')
                    .map(tag => ({
                        'name': tag.name,
                        'description': tag.description
                    })),
				'gsheet': method.tags.filter(tag => tag.type === 'gsheet')
                    .map(tag => ({
                        'name': tag.name,
                        'description': tag.description
                    })),
				'sqsqueue': method.tags.filter(tag => tag.type === 'sqsqueue')
                    .map(tag => ({
                        'name': tag.name,
                        'description': tag.description
                    })),
                'return': method.tags.filter(tag =>
                    tag.type === 'return' || tag.type === 'returns')
                    .map(tag => ({
                        'types': tag.types,
                        'description': tag.description
                    })),
				'snippet': method.tags.filter(tag => tag.type === 'snippet')
                    .map(tag => tag.string)
            }
        }))
        .filter(method => !method.empty);

module.exports = parser;
