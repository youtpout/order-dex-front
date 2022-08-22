import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenService } from './services/token.service';
import { WalletService } from './services/wallet.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Order Dex';
  account: any;
  loading = false;
  isProd = environment.production;
  isMenuOpen = false;
  balance: Observable<number> = of(0);

  constructor(private _walletService: WalletService, private _tokenService: TokenService) {
    this._walletService.account$.subscribe(r => {
      this.account = r;
      this.balance = _tokenService.getBalance(environment.tokenAddress, r);
    });
  }

  connect(): void {
    this._walletService.connect().subscribe();
  }
}
