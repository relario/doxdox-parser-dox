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
     * Dox parser for doxdox.
	 * @summary this is the function description
	 * @sourcecode https://github.com/relario/hypercentage-wp-noc/blob/master/postAffiliatePro/t-hypercentage-postaffiliatepro/handler.js#L221
	 * @invocation arn:aws:sns:eu-west-1:622060920639:t-relario-pandora-core-800Answer
	 * @apigateway http://apiprofiling.relario.com/v1/topup
     * @param {string} event The first color, in hexadecimal format.
     * @param {string} context The second color, in hexadecimal format.
	 * @param {string} callback The third color, in hexadecimal format.
	 * @topic arn:aws:sns:eu-west-1:622060920639:t-relario-pandora-core-630
	 * @property {string} key Description of key value for SNS message.
     * @return {Error} 402 | bad request.
	 * @snippet code snippets go here.
	 * more code snippet here.
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
                    .map(tag => tag.string),
				'invocation': method.tags.filter(tag => tag.type === 'invocation')
                    .map(tag => tag.string),
				'apigateway': method.tags.filter(tag => tag.type === 'apigateway')
                    .map(tag => tag.string),
                'param': method.tags.filter(tag => tag.type === 'param')
                    .map(tag => ({
                        'name': formatStringForParam(tag.name),
                        'isOptional': tag.optional,
                        'types': tag.types,
                        'description': tag.description
                    })),
                'topic': method.tags.filter(tag => tag.type === 'topic')
                    .map(tag => tag.string),
				'property': method.tags.filter(tag => tag.type === 'property')
                    .map(tag => ({
                        'name': formatStringForParam(tag.name),
                        'types': tag.types,
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
