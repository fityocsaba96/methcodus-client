import * as CodeMirror from 'codemirror';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/display/panel';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/scroll/simplescrollbars';
import 'codemirror/addon/search/match-highlighter';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/selection/active-line';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/javascript/javascript';
import 'codemirror-revisedsearch';
import { CodeEditorActionEvent, CodeEditorEditMode, CodeEditorLanguage } from './code-editor.component.interface';
import { Component, ElementRef, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { clone, join, lensProp, map, mapObjIndexed, over, pick, pipe } from 'ramda';

@Component({
  selector: 'app-code-editor',
  template: '',
})
export class CodeEditorComponent implements OnInit {
  @Input()
  public language: CodeEditorLanguage;

  private _editMode?: CodeEditorEditMode;
  public get editMode(): CodeEditorEditMode {
    return this._editMode;
  }
  @Input('edit-mode')
  public set editMode(editMode: CodeEditorEditMode) {
    if (this.codeEditor !== undefined) {
      this.setEditMode(editMode);
    } else {
      this.initialEditMode = editMode;
    }
  }

  private _value?: string;
  public get value(): string {
    return this.codeEditor.getValue();
  }
  @Input()
  public set value(value: string) {
    this._value = value;
  }

  @Output()
  public action = new EventEmitter<CodeEditorActionEvent>();

  private codeEditor: CodeMirror.Editor;
  private initialEditMode?: CodeEditorEditMode;
  private inactiveOverlayElement?: HTMLDivElement;
  private unprocessedChangesOfInput = 0;
  private actionInProgress = false;

  constructor(private component: ElementRef) {}

  public ngOnInit(): void {
    this.deleteCommands(['replace', 'toggleOverwrite']);
    this.codeEditor = CodeMirror(this.component.nativeElement, {
      value: this._value ?? '',
      mode: this.getMode(),
      theme: 'tomorrow-night-bright',
      scrollbarStyle: 'overlay',
      lineNumbers: true,
      showCursorWhenSelecting: true,
      pasteLinesPerSelection: false,
      lineWiseCopyCut: false,
      dragDrop: false,
      extraKeys: {
        'Ctrl-/': 'toggleComment',
        Tab: codeEditor => codeEditor.replaceSelection(' '.repeat(codeEditor.getOption('indentUnit'))),
      },
    });
    this.setEditMode(this.initialEditMode ?? CodeEditorEditMode.Normal);
    this.codeEditor.addPanel(document.createElement('div'), { position: 'bottom' });
    const inputfield = this.codeEditor.getInputField();
    inputfield.focus();
    inputfield.blur();
    this.codeEditor.on('beforeSelectionChange', this.cancelSelectionChangeAndEmitActionEvent.bind(this));
    this.codeEditor.on('beforeChange', this.cancelContentChangeAndEmitActionEvent.bind(this));
    this.codeEditor.on('keydown', this.cancelCommandAndEmitActionEvent.bind(this));
  }

  private deleteCommands(commands: string[]): void {
    commands.forEach(command => delete (CodeMirror.commands as any)[command]);
  }

  private getMode(): string {
    switch (this.language) {
      case CodeEditorLanguage.JavaScript:
        return 'text/javascript';
      case CodeEditorLanguage.Java:
        return 'text/x-java';
    }
  }

  private setEditMode(editMode: CodeEditorEditMode): void {
    switch (editMode) {
      case CodeEditorEditMode.Normal:
        this.setNormalEditMode();
        return;
      case CodeEditorEditMode.ReadOnly:
        this.setReadOnlyEditMode();
        return;
      case CodeEditorEditMode.Inactive:
        this.setInactiveEditMode();
        return;
    }
  }

  private setNormalEditMode(): void {
    if (this._editMode !== CodeEditorEditMode.Normal) {
      if (this._editMode === CodeEditorEditMode.Inactive) {
        this.removeInactiveOverlay();
      }
      this.setEditModeOptions(CodeEditorEditMode.Normal);
      this._editMode = CodeEditorEditMode.Normal;
    }
  }

  private removeInactiveOverlay(): void {
    this.inactiveOverlayElement.classList.remove('transition');
    this.inactiveOverlayElement.addEventListener('transitionend', event => (event.target as HTMLDivElement).remove());
    this.inactiveOverlayElement = undefined;
  }

  private setEditModeOptions(editMode: CodeEditorEditMode): void {
    const notNormalEditMode = editMode !== CodeEditorEditMode.Normal;
    const notReadOnlyEditMode = editMode !== CodeEditorEditMode.ReadOnly;
    if (this._editMode === undefined || (this._editMode !== CodeEditorEditMode.Normal) !== notNormalEditMode) {
      this.codeEditor.setOption('readOnly', notNormalEditMode);
    }
    if (this._editMode === undefined || (this._editMode !== CodeEditorEditMode.ReadOnly) !== notReadOnlyEditMode) {
      this.codeEditor.setOption('styleActiveLine', notReadOnlyEditMode);
      this.codeEditor.setOption('highlightSelectionMatches', notReadOnlyEditMode ? { delay: 0, minChars: 1, trim: false } : false);
      this.codeEditor.setOption('cursorBlinkRate', notReadOnlyEditMode ? CodeMirror.defaults.cursorBlinkRate : -Infinity);
      this.codeEditor.setOption('matchBrackets', notReadOnlyEditMode);
    }
    const inputfield = this.codeEditor.getInputField();
    if (this.codeEditor.hasFocus()) {
      inputfield.blur();
      inputfield.focus();
    }
  }

  private setReadOnlyEditMode(): void {
    if (this._editMode !== CodeEditorEditMode.ReadOnly) {
      if (this._editMode === CodeEditorEditMode.Inactive) {
        this.removeInactiveOverlay();
      }
      this.setEditModeOptions(CodeEditorEditMode.ReadOnly);
      this._editMode = CodeEditorEditMode.ReadOnly;
    }
  }

  private setInactiveEditMode(): void {
    if (this._editMode !== CodeEditorEditMode.Inactive) {
      this.inactiveOverlayElement = document.createElement('div');
      this.inactiveOverlayElement.tabIndex = 0;
      this.inactiveOverlayElement.addEventListener('focus', () => this.codeEditor.focus());
      this.inactiveOverlayElement.className = 'inactive-overlay';
      this.codeEditor.addWidget({ line: 0, ch: 0 }, this.inactiveOverlayElement, false);
      queueMicrotask(() => this.inactiveOverlayElement.classList.add('transition'));
      this.setEditModeOptions(CodeEditorEditMode.Inactive);
      this._editMode = CodeEditorEditMode.Inactive;
    }
  }

  private async cancelSelectionChangeAndEmitActionEvent(
    codeEditor: CodeMirror.Editor,
    change: CodeMirror.EditorSelectionChange,
  ): Promise<void> {
    if (!this.actionInProgress) {
      const newChange = await this.cancelSelectionChange(codeEditor, change);
      if (this._editMode !== CodeEditorEditMode.Inactive) {
        const details = pipe(
          pick(['ranges', 'origin']),
          over(lensProp('ranges'), map(pipe(pick(['anchor', 'head']), mapObjIndexed(pick(['line', 'ch']))))),
        )(newChange);
        this.emitActionEvent({ name: 'selection-change', details });
      }
    }
  }

  private cancelSelectionChange(
    codeEditor: CodeMirror.Editor,
    change: CodeMirror.EditorSelectionChange,
  ): Promise<CodeMirror.EditorSelectionChange> {
    return new Promise(resolve => {
      const newChange = clone(change);
      change.update(codeEditor.listSelections());
      const getCursor = codeEditor.getCursor;
      codeEditor.getCursor = () => newChange.ranges[newChange.ranges.length - 1].head;
      const history = (codeEditor.getDoc() as any).history;
      const { lastSelTime, lastSelOrigin, lastSelOp }: { lastSelTime: number; lastSelOrigin: string; lastSelOp: number } = history;
      if (this._editMode !== CodeEditorEditMode.ReadOnly) {
        codeEditor.setOption('styleActiveLine', false);
        codeEditor.setOption('styleActiveLine', true);
      }
      queueMicrotask(() => {
        codeEditor.getCursor = getCursor;
        [history.lastSelTime, history.lastSelOrigin, history.lastSelOp] = [lastSelTime, lastSelOrigin, lastSelOp];
        resolve(newChange);
      });
    });
  }

  private emitActionEvent(action: CodeEditorActionEvent['action']): void {
    let cancelled = false;
    const actionEvent: CodeEditorActionEvent = { action, cancel: () => (cancelled = true) };
    this.action.emit(actionEvent);
    if (!cancelled) {
      this.executeAction(actionEvent.action);
    }
  }

  public executeAction({ name, details }: CodeEditorActionEvent['action']): void {
    this.actionInProgress = true;
    switch (name) {
      case 'selection-change':
        this.codeEditor.setSelections(details.ranges, null, { origin: details.origin });
        break;
      case 'content-change':
        (this.codeEditor as any).replaceSelection(details.text, null, details.origin);
        (this.codeEditor as any).triggerElectric();
        break;
      case 'command':
        (this.codeEditor as any).display.shift = details.setShift;
        if (details.type === 'default') {
          this.codeEditor.execCommand(details.name);
        } else if (details.type === 'extra') {
          this.codeEditor.getOption('extraKeys')[details.name](this.codeEditor);
        }
        (this.codeEditor as any).display.shift = false;
        break;
    }
    this.actionInProgress = false;
  }

  private cancelContentChangeAndEmitActionEvent(codeEditor: CodeMirror.Editor, change: CodeMirror.EditorChangeCancellable): void {
    if (!this.actionInProgress) {
      change.cancel();
      if (this._editMode === CodeEditorEditMode.Normal && this.isLastChangeOfInput()) {
        const details = pipe(pick(['text', 'origin']), over(lensProp('text'), join(codeEditor.lineSeparator())))(change);
        this.emitActionEvent({ name: 'content-change', details });
      }
    }
  }

  private isLastChangeOfInput(): boolean {
    if (this.unprocessedChangesOfInput === 0) {
      this.unprocessedChangesOfInput = this.codeEditor.listSelections().length;
    }
    const lastChangeOfInput = this.unprocessedChangesOfInput === 1;
    this.unprocessedChangesOfInput--;
    return lastChangeOfInput;
  }

  private cancelCommandAndEmitActionEvent(codeEditor: CodeMirror.Editor, event: KeyboardEvent): void {
    if (!this.actionInProgress) {
      if (this._editMode === CodeEditorEditMode.Normal) {
        const commandDetails = this.getCommandDetails(event, 'extraKeys') ?? this.getCommandDetails(event, 'keyMap');
        const findPressed = commandDetails?.name === 'find';
        if (commandDetails !== undefined && !findPressed) {
          event.preventDefault();
          const details = commandDetails;
          this.emitActionEvent({ name: 'command', details });
        } else if (findPressed) {
          queueMicrotask(this.modifyFindDialog.bind(this));
        }
      } else {
        const key = event.key.toLowerCase();
        if (!(this._editMode === CodeEditorEditMode.ReadOnly && (event.ctrlKey || event.metaKey) && (key === 'a' || key === 'c'))) {
          event.preventDefault();
        }
      }
    }
    queueMicrotask(() => ((codeEditor as any).display.shift = false));
  }

  private getCommandDetails(
    event: KeyboardEvent,
    keyMapType: keyof CodeMirror.EditorConfiguration,
  ): CodeEditorActionEvent['action']['details'] {
    let commandDetails = this.getCommandDetailsWithSetShift(event, keyMapType, false);
    if (commandDetails === undefined && event.shiftKey && event.key !== 'Shift') {
      commandDetails = this.getCommandDetailsWithSetShift(event, keyMapType, true);
    }
    return commandDetails;
  }

  private getCommandDetailsWithSetShift(
    event: KeyboardEvent,
    keyMapType: keyof CodeMirror.EditorConfiguration,
    setShift: boolean,
  ): CodeEditorActionEvent['action']['details'] {
    let commandDetails: CodeEditorActionEvent['action']['details'];
    const keyName: string = (CodeMirror as any).keyName(event, setShift);
    (CodeMirror as any).lookupKey(
      keyName,
      this.codeEditor.getOption(keyMapType),
      (found: string | any) => {
        if (typeof found === 'string' && CodeMirror.commands[found] !== undefined && (!setShift || /^go[A-Z]/.test(found))) {
          commandDetails = { type: 'default', name: found, setShift };
        } else if (typeof found === 'function' && (!setShift || found.motion !== undefined)) {
          commandDetails = { type: 'extra', name: keyName, setShift };
        }
        return commandDetails;
      },
      this.codeEditor,
    );
    return commandDetails;
  }

  private modifyFindDialog(): void {
    const codeEditorElement = this.codeEditor.getWrapperElement();
    const findDialogElement = codeEditorElement.previousElementSibling as HTMLDivElement;
    codeEditorElement.parentElement.append(findDialogElement);
    codeEditorElement.style.height = `${codeEditorElement.offsetHeight - findDialogElement.offsetHeight}px`;
    const findInputElement = findDialogElement.firstElementChild.children[1] as HTMLInputElement;
    findInputElement.autocapitalize = 'off';
    findInputElement.autocomplete = 'off';
    findInputElement.spellcheck = false;
    findInputElement.focus();
  }
}
