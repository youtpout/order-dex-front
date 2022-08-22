import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { environment } from 'src/environments/environment';
import { IOrderCreate } from '../models/order-create';
import { GlobalService } from '../services/global.service';
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
  token0: string = environment.wmaticAddress;
  token1: string = environment.tokenAddress;
  message: string = "";

  form: FormGroup = new FormGroup({
    quantity: new FormControl(1, Validators.required),
    price: new FormControl(1, Validators.required),
  });


  constructor(private _orderService: OrderService,
    private _notification: NotificationService,
    private _walletService: WalletService,
    private _sanitizer: DomSanitizer,
    private _route: ActivatedRoute,
    private _globalService: GlobalService) { }

  ngOnInit(): void {
    let total = this.form.value.quantity * this.form.value.price;
    let pairName = this.pair!.split('-');
    if (pairName?.length > 1) {
      this.message = `${this.form.value.quantity} ${pairName[1]} for ${total} ${pairName[0]}`;
    };
    this.form.valueChanges.subscribe((r: any) => {
      if (r.quantity && r.price) {
        total = r.quantity * r.price;
        pairName = this.pair!.split('-');
        if (pairName?.length > 1) {
          this.message = `${r.quantity} ${pairName[1]} for ${total} ${pairName[0]}`;
        };
      }
    });

    this._walletService.account$.subscribe(r => {
      if (r.length) {
        this.account = r[0];
      }
    });

    this._route.paramMap.subscribe((params: ParamMap) => {
      this.pair = params.get('pair');
      if (this.pair?.startsWith("WETH")) {
        this.token0 = environment.wethAddress;
      }
      if (this.pair?.startsWith("Matic")) {
        this.token0 = environment.wmaticAddress;
      }
      if (this.pair?.endsWith("ODT")) {
        this.token1 = environment.tokenAddress;
      }
      if (this.pair?.endsWith("WETH")) {
        this.token1 = environment.wethAddress;
      }
    });
  }

  buy() {
    this.createOrder(false);
  }

  sell() {
    this.createOrder(true);

  }

  createOrder(sell: boolean) {
    this._globalService.setLoading(true);
    let toSell = sell ? this.token1 : this.token0;
    let toBuy = sell ? this.token0 : this.token1;
    let data = this.form.value;
    let quantity = parseFloat(data.quantity);
    let price = parseFloat(data.price);
    let order: IOrderCreate = {
      amountToBuy: quantity,
      amountToSell: quantity * price,
      tokenToBuy: toBuy,
      tokenToSell: toSell,
      toETH: toBuy === environment.wmaticAddress
    };
    console.log("order", order);
    if (toSell === environment.wmaticAddress) {
      console.log("eth order");
      this._orderService.createOrderFromETH(order).subscribe(
        {
          next: () => {
            this._notification.showSuccess('Order created, you can see your order on History page');
            this._globalService.setLoading(false);
          },
          error: (e) => {
            console.log(e);
            this._notification.showError(e.data?.message || e.message);
            this._globalService.setLoading(false);
          }
        });
    } else {
      this._orderService.createOrder(order).subscribe(
        {
          next: () => {
            this._notification.showSuccess('Order created, you can see your order on History page');
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
}
