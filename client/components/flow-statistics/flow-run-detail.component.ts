import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { Profile } from '../../../../its_you_online_auth/client/interfaces';
import { FlowStep } from '../../../../rogerthat_api/client/interfaces';
import { WidgetType } from '../../../../rogerthat_api/client/interfaces/forms';
import { FlowRun } from '../../interfaces';
import { FlowRunStatus } from '../../interfaces/flow-statistics.interfaces';

@Component({
  selector: 'tff-flow-run-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: 'flow-run-detail.component.html',
  styles: [ `
    .steps {
      width: 300px;
    }

    .step-margin > * {
      margin-bottom: 8px;
    }

    .step-margin {
      margin-top: 8px;
    }` ],
})
export class FlowRunDetailComponent {
  WidgetType = WidgetType;
  @Input() flowRun: FlowRun;
  @Input() user: Profile;

  getStepTitle(stepId: string) {
    return stepId.replace('message_', '');
  }

  shouldShowNextStep(flowRun: FlowRun) {
    return [ FlowRunStatus.STARTED, FlowRunStatus.IN_PROGRESS, FlowRunStatus.STALLED ].includes(flowRun.status);
  }

  trackSteps(index: number, step: FlowStep) {
    return index;
  }

}