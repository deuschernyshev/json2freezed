import Json2Freezed from "./Json2Freezed";
import StringFormatter from "./string_formatter";

class JsonConverter {
    _filename: string;
    _jsonString: string;
    _dartClassName: string;

    constructor(filename: string, jsonString: string) {
        this._filename = filename;
        this._jsonString = jsonString;
        this._dartClassName = StringFormatter.toUpperCamelCase(filename);
    }

    public convertJsonToFreezed(): string {
        return this._combineGeneratedParts();
    }

    private _combineGeneratedParts(): string {
        let result: string = '';

        //? Imports
        result += this._addImports();
        result += this._addSpacesBetweenLines(2);

        //? Class heading
        result += this._addClassHeading();
        result += this._addSpacesBetweenLines();

        //? Class body
        result += this._addStringsWithIdentation(2, [
            this._addConstructorHeading(),

            this._addStringsWithIdentation(4, [
                ...this._generateDartFields(),
            ]),

            this._addConstructorTrailing(),

            this._addSpacesBetweenLines(),
            this._addFromJsonFactoryConstructor(),
        ]);

        //? EOF
        result += this._addTrailingCurlyBrace();

        return result;
    }

    private _addImports(): string {
        let result = '';

        const freezedPackageImport = "import 'package:freezed_annotation/freezed_annotation.dart';";

        const freezedPart = `part '${StringFormatter.toSnakeCase(this._filename)}.freezed.dart';`;
        const jsonSerializablePart = `part '${StringFormatter.toSnakeCase(this._filename)}.g.dart';`;

        result += freezedPackageImport;
        result += this._addSpacesBetweenLines(2);
        result += freezedPart;
        result += this._addSpacesBetweenLines();
        result += jsonSerializablePart;

        return result;
    }

    private _addClassHeading(): string {
        let result = '';

        const freezedAnnotation = '@freezed';
        const classHeading = `class ${this._dartClassName} with _$${this._dartClassName} {`;

        result += freezedAnnotation;
        result += this._addSpacesBetweenLines();
        result += classHeading;

        return result;
    }

    private _addTrailingCurlyBrace(): string {
        return '}\n';
    }

    private _addSpacesBetweenLines(numOfSpaces: number = 1): string {
        let result = '';

        for (let i: number = 0; i < numOfSpaces; i++) {
            result += '\n';
        }

        return result;
    }

    private _addStringsWithIdentation(numOfSpaces: number = 2, strings: string[] = []): string {
        let result = '';

        for (let i: number = 0; i < strings.length; i++) {
            let temp = '';

            for (let j: number = 0; j < numOfSpaces; j++) {
                temp += ' ';
            }

            temp += strings[i];
            temp += this._addSpacesBetweenLines();

            result += temp;
        }

        return result;
    }

    private _addConstructorHeading(): string {
        return `const factory ${this._dartClassName}({`;
    }

    private _addConstructorTrailing(): string {
        let result = '';

        result += '}) = _';
        result += this._dartClassName + ';';

        return result;
    }

    private _addFromJsonFactoryConstructor(): string {
        let result = '';

        result += 'factory ';
        result += this._dartClassName;
        result += '.fromJson(Map<String, dynamic> json) => ';
        result += `_$${this._dartClassName}FromJson(json);`;

        return result;
    }

    private _makeObjectFromJsonString(): Object {
        return JSON.parse(this._jsonString);
    }

    private _generateDartFields(): string[] {
        const result: string[] = [];

        let obj: any = this._makeObjectFromJsonString();

        if (obj.constructor.name === 'Array' && obj.length > 0) {
            obj = obj[0];
        }

        if (obj.constructor.name === 'String') {
            return [];
        }

        for (const [key, value] of Object.entries(obj)) {
            const objectType = this._convertJsTypeToDartType(key, value);
            const strToPush = `${objectType} ${StringFormatter.toCamelCase(key)},`;

            result.push(strToPush);
        }

        return result;
    }

    private _convertJsTypeToDartType(key: any, value: any): string {
        let type: string = typeof value;

        if (value === null) {
            type = 'null';
        } else if (value.constructor.name === 'Array') {
            type = 'Array';

            if (value.length > 0) {
                value = value[0];
            }
        }

        const dartTypes = new Map<string, string>([
            ["string", "String"],
            ["boolean", "bool"],
            ["number", this._getDartNumType(value)],
            ["object", StringFormatter.toUpperCamelCase(key)],
            ["Array", `List<${StringFormatter.toUpperCamelCase(key)}>`],
            ["null", "Object"]
        ]);

        if (type === 'object' || type === 'Array') {
            Json2Freezed.createNewFile(key, JSON.stringify(value));
        }

        return this._getFieldNullSafetyConfiguration(dartTypes.get(type) ?? "Object");
    }

    private _getDartNumType(value: number): string {
        return value % 1 === 0 ? "int" : "double";
    }

    private _getFieldNullSafetyConfiguration(fieldType: string): string {
        return Json2Freezed.fieldsShouldBeRequired ? 'required ' + fieldType : fieldType + '?';
    }
}

export default JsonConverter;
