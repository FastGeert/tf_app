import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { filter, map, take, withLatestFrom } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { DialogService } from '../../../../framework/client/dialog';
import { getIdentity } from '../../../../framework/client/identity';
import { filterNull, IAppState } from '../../../../framework/client/ngrx';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { Profile } from '../../../../its_you_online_auth/client/interfaces';
import {
  GetGlobalStatsAction,
  GetInvestmentAgreementAction,
  GetUserAction,
  ResetInvestmentAgreementAction,
  UpdateInvestmentAgreementAction,
} from '../../actions';
import { GlobalStats, InvestmentAgreement, InvestmentAgreementsStatuses, TffPermission, TffPermissions } from '../../interfaces';
import { ApiErrorService } from '../../services';
import {
  getGlobalStats,
  getInvestmentAgreement,
  getInvestmentAgreementStatus,
  getUser,
  updateInvestmentAgreementStatus,
} from '../../tff.state';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <tff-investment-agreement [investmentAgreement]="investmentAgreement$ | async"
                              [status]="status$ | async"
                              [globalStats]="globalStats$ | async"
                              [updateStatus]="updateStatus$ | async"
                              [canUpdate]="canUpdate$ | async"
                              [user]="user$ | async"
                              (onUpdate)="onUpdate($event)"></tff-investment-agreement>`
})

export class InvestmentAgreementDetailPageComponent implements OnInit, OnDestroy {
  investmentAgreement$: Observable<InvestmentAgreement>;
  status$: Observable<ApiRequestStatus>;
  updateStatus$: Observable<ApiRequestStatus>;
  globalStats$: Observable<GlobalStats>;
  canUpdate$: Observable<boolean>;
  user$: Observable<Profile | null>;

  private _investmentSub: Subscription;
  private _errorSub: Subscription;
  private _getUserSubscription: Subscription;

  constructor(private store: Store<IAppState>,
              private route: ActivatedRoute,
              private translate: TranslateService,
              private dialogService: DialogService,
              private apiErrorService: ApiErrorService) {
  }

  ngOnInit() {
    const agreementId = this.route.snapshot.params.investmentAgreementId;
    this.store.dispatch(new ResetInvestmentAgreementAction());
    this.store.dispatch(new GetInvestmentAgreementAction(agreementId));
    this.investmentAgreement$ = this.store.select(getInvestmentAgreement).pipe(filterNull());
    this.status$ = this.store.select(getInvestmentAgreementStatus);
    this.updateStatus$ = this.store.select(updateInvestmentAgreementStatus);
    this.canUpdate$ = this.store.select(getIdentity).pipe(
      filterNull(),
      map(identity => (<TffPermission[]>identity.permissions).some(p => TffPermissions.BACKEND_ADMIN.includes(p))),
    );
    this.globalStats$ = this.store.select(getGlobalStats).pipe(filterNull());
    this.user$ = this.store.select(getUser);
    this._investmentSub = this.investmentAgreement$.pipe(filter(i => i.token !== null)).subscribe(investment => {
      this.store.dispatch(new GetGlobalStatsAction(investment.token));
    });
    this._errorSub = this.updateStatus$.pipe(filter(status => !status.success && !status.loading && status.error !== null))
      .subscribe(status => this.apiErrorService.showErrorDialog(status.error));
    this._getUserSubscription = this.status$.pipe(
      filter(s => s.success),
      withLatestFrom(this.investmentAgreement$),
      take(1),
    ).subscribe(([ _, investment ]) => this.store.dispatch(new GetUserAction(<string>investment.username)));
  }

  ngOnDestroy() {
    this._investmentSub.unsubscribe();
    this._errorSub.unsubscribe();
    this._getUserSubscription.unsubscribe();
  }

  onUpdate(agreement: InvestmentAgreement) {
    this.store.dispatch(new UpdateInvestmentAgreementAction(agreement));
    if (agreement.status === InvestmentAgreementsStatuses.SIGNED) {
      this.dialogService.openAlert({
        message: this.translate.instant('tff.mark_as_paid_info'),
        ok: this.translate.instant('tff.close')
      });
    }
  }
}
