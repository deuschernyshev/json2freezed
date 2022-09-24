import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import JsonConverter from './json_converter';
import StringFormatter from './string_formatter';

class Json2Freezed {
    static fieldsShouldBeRequired: boolean = true;
    static _filePath: string = '';

    constructor() { }

    public async generateFreezedModelFromJson(): Promise<void> {
        try {
            await Json2Freezed._setFieldsShouldBeRequired();
        } catch (error) {
            return;
        }

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '❄ Generating Freezed files...',
            cancellable: false,
        }, async (progress) => {
            const doc = vscode.window.activeTextEditor?.document;
            Json2Freezed._filePath = doc!.fileName;
            const filename = path.parse(Json2Freezed._filePath!).base.split('.')[0];

            try {
                await Json2Freezed.createNewFile(filename, doc?.getText() ?? '');
            } catch (error) {
                if (error instanceof Error) {
                    vscode.window.showErrorMessage(error.message);
                }
            }
        });

    }

    private static _getDirPath(): string {
        return path.dirname(Json2Freezed._filePath);
    }

    public static async createNewFile(filename: string, jsonString: string): Promise<void> {
        const jsonConverter = new JsonConverter(filename, jsonString);
        const generatedFreezedText = jsonConverter.convertJsonToFreezed();

        try {
            await fs.promises.writeFile(Json2Freezed._getDirPath() + '/' + StringFormatter.toSnakeCase(filename) + '.dart', generatedFreezedText);
        } catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(error.message);
            }
        }
    }

    private static async _setFieldsShouldBeRequired(): Promise<void> {
        const answer = await vscode.window.showInformationMessage('❄ Are fields should to be required?', 'Yes', 'No');

        if (answer === 'Yes') {
            Json2Freezed.fieldsShouldBeRequired = true;
        } else if (answer === 'No') {
            Json2Freezed.fieldsShouldBeRequired = false;
        } else {
            throw Error();
        }
    }
}

export default Json2Freezed;
