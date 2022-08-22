import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';
import { from, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BaseContract, BigNumber, ethers } from 'ethers';
import { OrderDexTokenInterface } from 'src/typechain-types/contracts/OrderDexToken';
import { contracts, ERC20, ERC20__factory, OrderBook, OrderBook__factory, OrderDexToken, OrderDexToken__factory } from 'src/typechain-types';
import { environment } from 'src/environments/environment';
import { IOrderCreate } from '../models/order-create';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  _signer: any;
  _contract: OrderBook;
  oneToken: BigNumber = ethers.utils.parseUnits("1", 18);

  constructor() {
    const win: any = window;

    this._contract = new ethers.Contract(environment.contractAddress, OrderBook__factory.abi) as OrderBook;
    if (win.ethereum) {
      const webprovider = new ethers.providers.Web3Provider(win.ethereum, "any");
      this._signer = webprovider.getSigner();
      this._contract = new ethers.Contract(environment.contractAddress, OrderBook__factory.abi, this._signer) as OrderBook;
    }
  }


  createOrder(order: IOrderCreate): Observable<any> {
    let amountToSell = ethers.utils.parseUnits(order.amountToSell.toString(), 18);
    let amountToBuy = ethers.utils.parseUnits(order.amountToBuy.toString(), 18);
    return from(this._contract.createOrder(order.tokenToSell, order.tokenToBuy, amountToSell, amountToBuy, order.toETH));
  }

  createOrderFromETH(order: IOrderCreate): Observable<any> {
    let amountToSell = ethers.utils.parseUnits(order.amountToSell.toString(), 18);
    let amountToBuy = ethers.utils.parseUnits(order.amountToBuy.toString(), 18);
    return from(this._contract.createOrderFromETH(order.tokenToBuy, amountToBuy, { value: amountToSell }));
  }

}
