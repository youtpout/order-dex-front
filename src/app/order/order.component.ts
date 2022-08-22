import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { OrderService } from '../services/order.service';
import { WalletService } from '../services/wallet.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {

  account: any;
  pair: string | null = "matic-odt";

  form: FormGroup = new FormGroup({
    quantity: new FormControl(1, Validators.required),
    price: new FormControl(1, Validators.required),
  });


  constructor(private _orderService: OrderService,
    private _notification: NotificationService,
    private _walletService: WalletService,
    private _sanitizer: DomSanitizer,
    private _route: ActivatedRoute) { }

  ngOnInit(): void {
    this._walletService.account$.subscribe(r => {
      if (r.length) {
        this.account = r[0];
      }
    });

    this._route.paramMap.subscribe((params: ParamMap) => {
      this.pair = params.get('pair');
    });
  }

  buy() {


  }

  sell() {


  }
}
