import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { GlobalStats } from '../../interfaces/global-stats.interfaces';
import { NgForm } from '@angular/forms';

@Component({
  moduleId: module.id,
  selector: 'global-stats-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'global-stats-detail.component.html'
})
export class GlobalStatsDetailComponent {
  @Output() onSave = new EventEmitter<GlobalStats>();

  private _globalStats: GlobalStats;

  get globalStats() {
    return this._globalStats;
  }

  @Input()
  set globalStats(value: GlobalStats) {
    this._globalStats = value ? Object.assign({}, value) : null;
  }

  save(form: NgForm) {
    if (form.form.valid) {
      this.onSave.emit(this.globalStats);
    }
  }
}