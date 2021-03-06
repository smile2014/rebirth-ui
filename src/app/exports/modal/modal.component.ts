import { Component, Input, ViewChild, EventEmitter, Output, ChangeDetectionStrategy, Renderer } from '@angular/core';
import { ModalOptions } from './modal-options.model';
import { ModalWindowComponent } from './modal-window.component';
import { DocumentRef } from '../window-ref';

@Component({
  selector: 're-modal',
  templateUrl: './modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
  static MODEL_OPEN_CSS = 'modal-open';
  @Input() isOpen: boolean = false;
  @Output() dismiss = new EventEmitter<any>();
  @Input() modalOptions: ModalOptions;
  @ViewChild(ModalWindowComponent) modalWindowComponent: ModalWindowComponent;
  instanceCount = 0;

  constructor(private renderer: Renderer, private documentRef: DocumentRef) {

  }

  open() {
    this.isOpen = true;
    this.modalWindowComponent.isOpen = true;
    this.toggleBodyClass(true);
  }

  close() {
    this.isOpen = false;
  }

  cleanup() {
    this.toggleBodyClass(false);
  }

  addContent<T>(options: ModalOptions, instanceCount: number): EventEmitter<T> {
    this.modalOptions = options;
    this.instanceCount = instanceCount;
    this.modalWindowComponent.addContent(options, this.dismiss);
    return this.dismiss;
  }

  private toggleBodyClass(isAdd: boolean): void {
    this.renderer.setElementClass(this.documentRef.body, ModalComponent.MODEL_OPEN_CSS, isAdd);
  }

}
