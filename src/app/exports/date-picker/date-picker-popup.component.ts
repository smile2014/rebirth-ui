import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  HostListener,
  forwardRef,
  ElementRef,
  Renderer, Output, EventEmitter
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectDateChangeEventArgs, SelectDateChangeReason } from './date-change-event-args.model';
import { RebirthUIConfig } from '../rebirth-ui.config';

export const RE_DATE_PICKER__POPUP_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatePickerPopupComponent),
  multi: true
};

@Component({
  selector: 're-date-picker-popup',
  templateUrl: './date-picker-popup.component.html',
  styleUrls: ['./date-picker-popup.component.scss'],
  providers: [RE_DATE_PICKER__POPUP_VALUE_ACCESSOR]
})
export class DatePickerPopupComponent implements OnInit, OnChanges, ControlValueAccessor {
  static DAY_DURATION = 24 * 60 * 60 * 1000;
  private _maxDate: Date;
  private _minDate: Date;
  @Input() selectedDate: Date;
  @Output() selectedDateChange = new EventEmitter<SelectDateChangeEventArgs>();
  @Input() showTimePicker: boolean;
  @Input() cssClass: string;
  currentYear: number;
  currentMonth: number;
  currentHour: number;
  currentMinute: number;
  dateConfig: any;
  hourOptions: string[];
  minuteOptions: string[];
  displayWeeks: any[];
  yearOptions: number[];
  disabled = false;

  onChange = (_: any) => null;
  onTouched = () => null;

  constructor(private elementRef: ElementRef, private renderer: Renderer, private rebirthUIConfig: RebirthUIConfig) {

    this.dateConfig = rebirthUIConfig.datePicker;
    this.showTimePicker = rebirthUIConfig.datePicker.timePicker;
    this.minDate = new Date(this.dateConfig.min, 0, 1, 0, 0, 0);
    this.maxDate = new Date(this.dateConfig.max, 11, 31, 23, 59, 59);
    this.renderer.setElementStyle(this.elementRef.nativeElement, 'display', 'inline-block');
  }

  @Input() set maxDate(date: Date | any) {
    this._maxDate = !date || date instanceof Date ? date : new Date(date);
  }

  get maxDate() {
    return this._maxDate;
  }

  @Input() set minDate(date: Date | any) {
    this._minDate = !date || date instanceof Date ? date : new Date(date);
  }

  get minDate() {
    return this._minDate;
  }


  ngOnInit() {
    this.hourOptions = new Array(24).fill(0).map((value, index) => this.fillLeft(index));
    this.minuteOptions = new Array(60).fill(0).map((value, index) => this.fillLeft(index));
    this.onSelectDateChanged();
    this.onDisplayWeeksChange();
    this.onYearRangeChange();
  }

  writeValue(obj: any): void {
    const date = !obj || obj instanceof Date ? obj : new Date(obj);
    this.selectedDate = date;
    this.onSelectDateChanged();
    this.onDisplayWeeksChange();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectDate(date) {
    if (this.isDisabledDay(date)) {
      return;
    }
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
      this.currentHour, this.currentMinute);
    this.onTouched();
    this.writeValue(selectedDate);
    this.onChange(selectedDate);
    this.selectedDateChange.emit({ reason: SelectDateChangeReason.date, date: this.selectedDate });
    if (this.currentMonth !== this.selectedDate.getMonth() || this.currentYear !== this.selectedDate.getFullYear()) {
      this.currentYear = this.selectedDate.getFullYear();
      this.currentMonth = this.selectedDate.getMonth();
      this.onDisplayWeeksChange();
    }
  }

  onTimeChange() {
    const date = this.selectedDate || new Date();
    this.selectedDate = new Date(date.getFullYear(), date.getMonth(),
      date.getDate(), this.currentHour, this.currentMinute);

    this.onTouched();
    this.writeValue(this.selectedDate);
    this.onChange(this.selectedDate);
    this.selectedDateChange.emit({ reason: SelectDateChangeReason.time, date: this.selectedDate });
  }

  hasPreMonth() {
    return this.currentMonth > 0 || this.currentYear > this.minDate.getFullYear();
  }

  onPreMonth() {
    if (!this.hasPreMonth()) {
      return;
    }

    if (this.currentMonth > 0) {
      this.currentMonth -= 1;
    } else {
      this.currentMonth = 11;
      this.currentYear -= 1;
    }

    this.onDisplayWeeksChange();
  }


  hasNextMonth() {
    return this.currentMonth < 11 || this.currentYear < this.maxDate.getFullYear();
  }

  onNextMonth() {
    if (!this.hasNextMonth()) {
      return;
    }

    if (this.currentMonth < 11) {
      this.currentMonth += 1;
    } else {
      this.currentMonth = 0;
      this.currentYear += 1;
    }

    this.onDisplayWeeksChange();
  }

  isDisabledDay(date) {
    const minDate = new Date(this.minDate.getFullYear(), this.minDate.getMonth(), this.minDate.getDate());
    const maxDate = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), this.maxDate.getDate(), 23, 59, 59);
    return this.disabled || (date.getTime() < minDate.getTime() ||
      date.getTime() > maxDate.getTime());
  }

  isSelectDay(date) {
    if (!this.selectedDate || !date) {
      return false;
    }
    return date.getFullYear() === this.selectedDate.getFullYear() &&
      date.getMonth() === this.selectedDate.getMonth() &&
      date.getDate() === this.selectedDate.getDate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (['minDate', 'maxDate'].some(key => !!changes[key])) {
      this.onYearRangeChange();
    }
  }

  onYearRangeChange() {
    const minYear = this.minDate.getFullYear();
    const maxYear = this.maxDate.getFullYear();
    this.yearOptions = new Array(maxYear - minYear + 1).fill(0).map((value, index) => {
      return minYear + index;
    });
  }

  @HostListener('click', ['$event'])
  onDocumentClick($event: Event) {
    $event.stopPropagation();
  }

  private onSelectDateChanged() {
    let date = this.selectedDate || new Date();
    if (date.getTime() < this.minDate.getTime()) {
      date = this.minDate;
    }
    if (date.getTime() > this.maxDate.getTime()) {
      date = this.maxDate;
    }
    this.currentYear = date.getFullYear();
    this.currentMonth = date.getMonth();
    this.currentHour = this.showTimePicker ? date.getHours() : 0;
    this.currentMinute = this.showTimePicker ? date.getMinutes() : 0;
  }

  private fillLeft(num: number) {
    return num < 10 ? `0${num}` : `${num}`;
  }

  private onDisplayWeeksChange() {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const weekOfDay = firstDayOfMonth.getDay();
    const startDate = new Date(firstDayOfMonth.getTime() - weekOfDay * DatePickerPopupComponent.DAY_DURATION);
    const displayWeeks = [];
    for (let i = 0; i < 6; i++) {
      const startWeekDate = startDate.getTime() + i * 7 * DatePickerPopupComponent.DAY_DURATION;
      const weekDays = new Array(7).fill(0).map((value, index) => {
        const currentDate = new Date(startWeekDate + index * DatePickerPopupComponent.DAY_DURATION);
        return {
          day: this.fillLeft(currentDate.getDate()),
          date: currentDate,
          inMonth: currentDate.getMonth().toString() === this.currentMonth.toString()
        };
      });
      displayWeeks.push(weekDays);
    }
    this.displayWeeks = displayWeeks;
  }

}
