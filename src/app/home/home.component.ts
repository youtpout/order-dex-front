import { Component, OnInit } from '@angular/core';
import { TokenService } from '../services/token.service';
import { WalletService } from '../services/wallet.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  account: any;

  constructor(private _walletService: WalletService, private _tokenService: TokenService) {
    this._walletService.account$.subscribe(r => {
      this.account = r;
    });
  }

  ngOnInit(): void {
  }

  add() {
    this._tokenService.addToken().then();
  }

}
