import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { RebirthUIConfig } from '../rebirth-ui.config';

@Component({
  selector: 're-rating',
  templateUrl: './rating.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'rating'
})
export class RatingComponent implements OnInit {
  ratingRanges: number[];
  @Input('ngModel') value = 0;
  @Input() disabled = false;
  @Input() cssClass: string;
  @Input() icons: { stateOn, stateOff };
  @Output('ngModelChange') valueChange = new EventEmitter<number>();
  statValue = 0;

  constructor(private rebirthUIConfig: RebirthUIConfig) {
    this.icons = rebirthUIConfig.rating.icons;
    this.ratingRanges = this.fillRatingRange(rebirthUIConfig.rating.max);
  }

  @Input('ngModel')
  set ratingValue(value: number) {
    this.statValue = this.value = value;
  }

  @Input()
  set max(value: number) {
    this.ratingRanges = this.fillRatingRange(value);
  }

  rate(value: number) {
    if (!this.disabled) {
      this.ratingValue = value;
      this.valueChange.emit(this.value);
    }
  }

  enter(value: number) {
    if (!this.disabled) {
      this.statValue = value;
    }
  }

  reset() {
    this.statValue = this.value;
  }

  private fillRatingRange(range: number) {
    return Array<number>(range).fill(0).map((_, i) => i + 1);
  }

  ngOnInit() {
  }

}
