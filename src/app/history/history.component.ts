import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { GlobalService } from '../services/global.service';
import { NotificationService } from '../services/notification.service';
import { OrderService } from '../services/order.service';
import { WalletService } from '../services/wallet.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  history: Observable<any[]> = of([]);
  displayedColumns: string[] = ['id', 'tokenToSell', 'tokenToBuy', 'filled', 'status', 'action'];
  account: any;
  constructor(private _orderService: OrderService,
    private _notification: NotificationService,
    private _walletService: WalletService,
    private _sanitizer: DomSanitizer,
    private _route: ActivatedRoute,
    private _globalService: GlobalService) { }

  ngOnInit(): void {
    this._walletService.account$.subscribe(r => {
      if (r.length) {
        this.account = r;
        this.history = this._orderService.getMyOrder(r);
      }
    });

  }

  cancel(id: string) {
    this._orderService.cancelOrder(id).subscribe(
      {
        next: () => {
          this._notification.showSuccess('Order canceled, you can see your order on History page');
          this._globalService.setLoading(false);
        },
        error: (e) => {
          console.log(e);
          this._notification.showError(e.data?.message || e.message);
          this._globalService.setLoading(false);
        }
      }
    );
  }

}
