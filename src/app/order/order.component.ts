import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
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
  pair: string | null = "odt-matic";
  token0: string = environment.tokenAddress;
  token1: string = environment.wmaticAddress;
  pair0: string = "odt";
  pair1: string = "matic";
  prices: Observable<any[]> = of([]);
  allowance0: BigNumber = BigNumber.from(0);
  allowance1: BigNumber = BigNumber.from(0);
  allow0 = false;
  allow1 = false;
  balance0: number = 0;
  balance1: number = 0;

  formBuy: FormGroup = new FormGroup({
    quantity: new FormControl(1, Validators.required),
    price: new FormControl(1, Validators.required),
    total: new FormControl(1, Validators.required)
  });


  formSell: FormGroup = new FormGroup({
    quantity: new FormControl(1, Validators.required),
    price: new FormControl(1, Validators.required),
    total: new FormControl(1, Validators.required)
  });



  constructor(private _orderService: OrderService,
    private _notification: NotificationService,
    private _walletService: WalletService,
    private _tokenService: TokenService,
    private _sanitizer: DomSanitizer,
    private _route: ActivatedRoute,
    private _globalService: GlobalService) { }

  ngOnInit(): void {
    let total = this.formBuy.value.quantity * this.formBuy.value.price;
    let pairName = this.pair!.split('-');
    if (pairName?.length > 1) {
      this.pair0 = pairName[0]?.toUpperCase();
      this.pair1 = pairName[1]?.toUpperCase();
    };

    this.formChanged(this.formBuy);
    this.formChanged(this.formSell);


    this._walletService.account$.subscribe(r => {
      if (r.length) {
        this.account = r;

        this.getAllowance();
        this.getBalances();
      }
    });

    this._route.paramMap.subscribe((params: ParamMap) => {
      this.pair = params.get('pair');
      let pairName = this.pair!.split('-');
      if (pairName?.length > 1) {
        this.pair0 = pairName[0]?.toUpperCase();
        this.pair1 = pairName[1]?.toUpperCase();
        if (pairName[0].toLowerCase() === "weth") {
          this.token0 = environment.wethAddress;
        }
        if (pairName[0].toLowerCase() === "matic") {
          this.token0 = environment.wmaticAddress;
        }
        if (pairName[0].toLowerCase() === "odt") {
          this.token0 = environment.tokenAddress;
        }
        if (pairName[1].toLowerCase() === "odt") {
          this.token1 = environment.tokenAddress;
        }
        if (pairName[1].toLowerCase() === "weth") {
          this.token1 = environment.wethAddress;
        }
        if (pairName[1].toLowerCase() === "matic") {
          this.token1 = environment.wmaticAddress;
        }

        this.getAllowance();
        this.getBalances();
        console.log("pairname", pairName);
        console.log("get pair", this.token0, this.token1);
        this.prices = this._orderService.getPairsPrice(this.token0, this.token1);
      }
    });
  }

  formChanged(form: FormGroup) {
    form.get("quantity")?.valueChanges.subscribe((quantity: number) => {
      let price = form.get("price")?.value || 0;
      let total = price * quantity;
      if (!isNaN(total)) {
        form.get("total")?.patchValue(parseFloat(total.toPrecision(8)), { emitEvent: false });
      }
    });

    form.get("price")?.valueChanges.subscribe((price: number) => {
      let quantity = form.get("quantity")?.value || 0;
      let total = price * quantity;
      if (!isNaN(total)) {
        form.get("total")?.patchValue(parseFloat(total.toPrecision(8)), { emitEvent: false });
      }
    });

    form.get("total")?.valueChanges.subscribe((total: number) => {
      let price = form.get("price")?.value || 0;
      let quantity = total / price;
      if (!isNaN(quantity)) {
        form.get("quantity")?.patchValue(parseFloat(quantity.toPrecision(8)), { emitEvent: false });
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

  getBalances() {
    this._tokenService.getBalance(this.token0, this.account).subscribe(r => {
      this.balance0 = r;
      console.log("balance0", r);
    });

    this._tokenService.getBalance(this.token1, this.account).subscribe(r => {
      this.balance1 = r;
      console.log("balance1", r);
    });
  }

  buy() {
    this.createOrder(true);
  }

  sell() {
    this.createOrder(false);

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

  createOrder(buy: boolean) {
    this._globalService.setLoading(true);
    let toSell = buy ? this.token1 : this.token0;
    let toBuy = buy ? this.token0 : this.token1;
    let data = buy ? this.formBuy.value : this.formSell.value;
    let quantity = data.quantity;
    let price = data.price;

    console.log(this.token0, this.pair0);
    let order: IOrderCreate = {
      amountToBuy: buy ? quantity : quantity * price,
      amountToSell: buy ? quantity * price : quantity,
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
