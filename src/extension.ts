import { TIMEOUT } from 'dns';
import * as vscode from 'vscode';
import Json2Freezed from './Json2Freezed';

export function activate(context: vscode.ExtensionContext) {
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "json2freezed" is now active!');

	const j2f = new Json2Freezed();
	const generateFreezedFile = vscode.commands.registerCommand('json2freezed.generateFreezedFile', j2f.generateFreezedModelFromJson);

	configureStatusBar();

	context.subscriptions.push(generateFreezedFile);
}

function configureStatusBar(): void {
	const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	
	myStatusBarItem.text = '❄ Json2Freezed';
	myStatusBarItem.command = 'json2freezed.generateFreezedFile';
	myStatusBarItem.show();
}

export function deactivate() { }
