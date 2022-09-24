class StringFormatter {
    public static toUpperCamelCase(str: string): string {
        let result = StringFormatter.toCamelCase(str);

        return result[0].toUpperCase() + result.slice(1);
    }

    public static toCamelCase(str: string): string {
        const lodash = require('lodash');

        return lodash.camelCase(str);
    }

    public static toSnakeCase(str: string): string {
        return str &&
            str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)!
                .map(x => x.toLowerCase())
                .join('_');
    }
}

export default StringFormatter;
