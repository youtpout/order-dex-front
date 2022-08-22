import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { token } from 'src/typechain-types/@openzeppelin/contracts';
import { GlobalService } from '../services/global.service';
import { NotificationService } from '../services/notification.service';
import { OrderService } from '../services/order.service';
import { TokenService } from '../services/token.service';
import { WalletService } from '../services/wallet.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  account: any;

  constructor(private _orderService: OrderService,
    private _notification: NotificationService,
    private _walletService: WalletService,
    private _tokenService: TokenService,
    private _sanitizer: DomSanitizer,
    private _route: ActivatedRoute,
    private _globalService: GlobalService) { }

  ngOnInit(): void {
    this._walletService.account$.subscribe(r => {
      this.account = r;
    });
  }

  add() {
    this._tokenService.addToken().then();
  }


  approve() {
    this._tokenService.approve(environment.tokenAddress).subscribe(
      {
        next: () => {
          this._notification.showSuccess('Approve succeed');
          this._globalService.setLoading(false);
        },
        error: (e) => {
          console.log(e);
          this._notification.showError(e.data?.message || e.message);
          this._globalService.setLoading(false);
        }
      });;
  }


}
