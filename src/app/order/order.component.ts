import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BigNumber } from 'ethers';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IOrderCreate } from '../models/order-create';
import { GlobalService } from '../services/global.service';
import { NotificationService } from '../services/notification.service';
import { OrderService } from '../services/order.service';
import { TokenService } from '../services/token.service';
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
  prices: Observable<any[]> = of([]);
  allowance0: BigNumber = BigNumber.from(0);
  allowance1: BigNumber = BigNumber.from(0);
  allow0 = false;
  allow1 = false;

  form: FormGroup = new FormGroup({
    quantity: new FormControl(1, Validators.required),
    price: new FormControl(1, Validators.required),
  });


  constructor(private _orderService: OrderService,
    private _notification: NotificationService,
    private _walletService: WalletService,
    private _tokenService: TokenService,
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
        this.account = r;

        this.getAllowance();
      }
    });

    this._route.paramMap.subscribe((params: ParamMap) => {
      this.pair = params.get('pair');
      let pairName = this.pair!.split('-');
      if (pairName?.length > 1) {
        this.message = `${this.form.value.quantity} ${pairName[1]} for ${total} ${pairName[0]}`;

        if (pairName[0].toLowerCase() === "weth") {
          this.token0 = environment.wethAddress;
        }
        if (pairName[0].toLowerCase() === "matic") {
          this.token0 = environment.wmaticAddress;
        }
        if (pairName[1].toLowerCase() === "odt") {
          this.token1 = environment.tokenAddress;
        }
        if (pairName[1].toLowerCase() === "weth") {
          this.token1 = environment.wethAddress;
        }

        this.getAllowance();
        console.log("pairname", pairName);
        console.log("get pair", this.token0, this.token1);
        this.prices = this._orderService.getPairsPrice(this.token0, this.token1);
      }
    });
  }

  getAllowance() {
    if (this.token0 !== environment.wmaticAddress) {
      this._tokenService.getAllowance(this.token0, this.account).subscribe(r => {
        this.allowance0 = r;
        this.allow0 = r.gt(BigNumber.from(10).pow(60));
      });
    } else {
      this.allow0 = true;
    }

    if (this.token1 !== environment.wmaticAddress) {
      this._tokenService.getAllowance(this.token1, this.account).subscribe(r => {
        this.allowance1 = r;
        console.log(r);
        this.allow1 = r.gt(BigNumber.from(10).pow(60));
      });
    } else {
      this.allow1 = true;
    }
  }

  buy() {
    this.createOrder(false);
  }

  sell() {
    this.createOrder(true);

  }

  approve(token: string) {
    this._tokenService.approve(token).subscribe(
      {
        next: () => {
          this.getAllowance();
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

  createOrder(sell: boolean) {
    this._globalService.setLoading(true);
    let toSell = sell ? this.token1 : this.token0;
    let toBuy = sell ? this.token0 : this.token1;
    let data = this.form.value;
    let quantity = parseFloat(data.quantity);
    let price = parseFloat(data.price);
    let order: IOrderCreate = {
      amountToBuy: sell ? quantity * price : quantity,
      amountToSell: sell ? quantity : quantity * price,
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
            this._notification.showSuccess('Order created, you can see your order on History page soon');
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
            this._notification.showSuccess('Order created, you can see your order on History page soon');
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

  // cancelOrder(id: number) {
  //   this._orderService.cancelOrder(id).subscribe(
  //     {
  //       next: () => {
  //         this._notification.showSuccess('Order canceled, you can see your order on History page');
  //         this._globalService.setLoading(false);
  //       },
  //       error: (e) => {
  //         console.log(e);
  //         this._notification.showError(e.data?.message || e.message);
  //         this._globalService.setLoading(false);
  //       }
  //     }
  //   );
  // }
}
