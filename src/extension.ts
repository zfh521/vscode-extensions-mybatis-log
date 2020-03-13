'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.myBatisLog2SQL', function () {
		// Get the active text editor
		let editor = vscode.window.activeTextEditor;
		let PREPARING_KEY_WORD = "Preparing: ";
		let PARAMETERS_KEY_WORD = "Parameters: ";
		let NEW_LINE_WORD = "\n";

		if (editor) {
			let document = editor.document;
			let selection = editor.selection;

			// Get the word within the selection
			let word = document.getText(selection);

			// 校验 MyBatis 日志 Preparing: 和 Parameters:
			let preparingWordIndex = word.indexOf(PREPARING_KEY_WORD);
			if (preparingWordIndex < 0) {
				vscode.window.showInformationMessage(`No keywords "${PREPARING_KEY_WORD} found!"`);
				return;
			}
			// 去除前面无用的干扰字符串
			word = word.substring(preparingWordIndex + PREPARING_KEY_WORD.length);	
			let parametersWordIndex = word.indexOf(PARAMETERS_KEY_WORD);
			if (preparingWordIndex < 0) {
				vscode.window.showInformationMessage(`No keywords "${PARAMETERS_KEY_WORD} found!"`);
				return;
			}
			// 第一行结束位置
			let preparingWordEndIndex = word.indexOf(NEW_LINE_WORD);
			let queryString = word.substring(0, preparingWordEndIndex);
			word = word.substring(parametersWordIndex + PARAMETERS_KEY_WORD.length);
			let parametersWordEndIndex = word.indexOf(NEW_LINE_WORD);
			// 
			let parameterString = word.substring(0, parametersWordEndIndex);
			let parameterArray = parameterString.split(', ');
			let parameterReplaceIndex = 0;
			while (queryString.indexOf("?") > -1) {
				// 防止参数过多, 死循环
				if (parameterReplaceIndex > 1000) {
					break;
				}
				let parameter = parameterArray[parameterReplaceIndex];
				let stringIndex = parameter.indexOf("(String)");
				let timestampIndex = parameter.indexOf("(Timestamp)");
				parameter = parameter.substring(0, parameter.indexOf("("));
				if (stringIndex > -1 || timestampIndex > -1) {
					parameter = `"${parameter}"`;
				}
				queryString = queryString.replace("?", parameter);
				parameterReplaceIndex++;
			}
			vscode.window.showInformationMessage(queryString);
		}
	});
	context.subscriptions.push(disposable);
}

