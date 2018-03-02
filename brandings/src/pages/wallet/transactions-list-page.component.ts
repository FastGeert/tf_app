import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, Refresher } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { GetAddresssAction, GetTransactionsAction } from '../../actions';
import { IAppState } from '../../app/app.state';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';
import { CURRENCY_TFT, KEY_NAME, ParsedTransaction, RIVINE_ALGORITHM, TransactionOutput, TransactionStatus } from '../../interfaces/wallet';
import { CryptoAddress } from '../../manual_typings/rogerthat';
import { RogerthatError } from '../../manual_typings/rogerthat-errors';
import { AmountPipe } from '../../pipes/amount.pipe';
import { getTotalAmount, getTransactions, getTransactionsStatus } from '../../state/app.state';
import { getAddress, getAddressStatus } from '../../state/rogerthat.state';
import { outputReducer } from '../../util/wallet';
import { ErrorService } from '../error.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'transactions-list-page.component.html',
})
export class TransactionsListPageComponent implements OnInit, OnDestroy {
  @ViewChild(Refresher) refresher: Refresher;
  symbol = CURRENCY_TFT;
  totalAmount$: Observable<number>;
  address$: Observable<CryptoAddress | null>;
  addressStatus$: Observable<ApiRequestStatus<RogerthatError>>;
  transactions$: Observable<ParsedTransaction[]>;
  transactionsStatus$: Observable<ApiRequestStatus>;

  private _addressStatusSub: Subscription;
  private _transactionStatusSub: Subscription;
  private _intervalSubscription: Subscription;

  constructor(private store: Store<IAppState>,
              private translate: TranslateService,
              private errorService: ErrorService,
              private amountPipe: AmountPipe,
              private alertCtrl: AlertController) {
  }

  ngOnInit() {
    this.store.dispatch(new GetAddresssAction({
      algorithm: RIVINE_ALGORITHM,
      index: 0,
      keyName: KEY_NAME,
      message: this.translate.instant('please_enter_your_pin'),
    }));
    this.address$ = this.store.pipe(select(getAddress));
    this.addressStatus$ = this.store.pipe(select(getAddressStatus));
    this.transactions$ = this.store.pipe(select(getTransactions));
    this.transactionsStatus$ = this.store.pipe(select(getTransactionsStatus));
    this.totalAmount$ = this.store.pipe(select(getTotalAmount));
    this._addressStatusSub = this.addressStatus$.subscribe(s => {
      if (!s.success && !s.loading && s.error !== null) {
        return this.showError(s.error.error!);
      } else if (s.success) {
        this.getTransactions();
      }
    });
    this._transactionStatusSub = this.transactionsStatus$.subscribe(s => {
      if (!s.success && !s.loading && s.error !== null) {
        this.showError(s.error!.error);
      } else if (!s.loading && s.success) {
        this.refresher.complete();
      }
    });
    // Refresh transactions every 5 minutes
    this._intervalSubscription = IntervalObservable.create(300000).subscribe(() => this.getTransactions());
  }

  ngOnDestroy() {
    this._addressStatusSub.unsubscribe();
    this._transactionStatusSub.unsubscribe();
    this._intervalSubscription.unsubscribe();
  }

  trackTransactions(index: number, transaction: ParsedTransaction) {
    return transaction.id;
  }

  getTransactions() {
    this.address$.pipe(first()).subscribe((address: CryptoAddress | null) => {
      if (address) {
        this.store.dispatch(new GetTransactionsAction(address.address));
      }
    });
  }

  getTransactionStatus(status: TransactionStatus) {
    return this.translate.instant(`transaction_status_${status}`);
  }

  getOutputText(output: TransactionOutput, transaction: ParsedTransaction): string {
    const key = transaction.receiving ? 'x_from_y' : 'x_to_y';
    return this.translate.instant(key, { x: this.amountPipe.transform(output.value), y: output.unlockhash });
  }

  getFee(transaction: ParsedTransaction): number {
    // inputs - outputs = fee
    return transaction.inputs.reduce(outputReducer, 0) - transaction.outputs.reduce(outputReducer, 0);
  }

  getColor(transaction: ParsedTransaction) {
    return transaction.receiving ? 'default' : 'danger';
  }

  showError(err: string) {
    this.alertCtrl.create({
      title: this.translate.instant('error'),
      message: this.errorService.getErrorMessage(err),
      buttons: [ this.translate.instant('ok') ],
    }).present();
  }
}
