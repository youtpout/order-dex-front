import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';
import { from, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BaseContract, BigNumber, ethers } from 'ethers';
import { OrderDexTokenInterface } from 'src/typechain-types/contracts/OrderDexToken';
import { contracts, ERC20, ERC20__factory, OrderBook, OrderBook__factory, OrderDexToken, OrderDexToken__factory } from 'src/typechain-types';
import { environment } from 'src/environments/environment';
import { IOrderCreate } from '../models/order-create';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  _signer: any;
  _contract: OrderBook;
  oneToken: BigNumber = ethers.utils.parseUnits("1", 18);

  queryTx = gql`
  query($first: Int, $skip: Int, $orderBy: String, $orderDirection: String, $where: Order_filter) {
    orders(
      first: $first, skip: $skip, where : $where, orderBy: $orderBy, orderDirection: $orderDirection) {
          amountToBuy
          amountToBuyCompleted
          amountToSell
          amountToSellCompleted
          fromETH
          feeAmount
          id
          status
          timestamp
          toETH
          tokenToBuy
          tokenToSell
          trader
          priceByTokenB
          priceByTokenA
    }
  }
`;

  constructor(private _apollo: Apollo) {
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

  cancelOrder(id: string): Observable<any> {
    return from(this._contract.cancelOrder(BigNumber.from(id)));
  }

  getMyOrder(account: string): Observable<any[]> {
    let where: any = { trader: account };
    const resultsPerPage = 100;
    const page = 0;
    const orderBy = "id";
    const orderDirection = "desc";

    // let result = this.client.query({
    //   query: gql(this.queryTx),
    //   variables: {
    //     first: 100,
    //     skip: page * resultsPerPage,
    //     orderBy: orderBy,
    //     orderDirection: orderDirection,
    //     where: where
    //   },
    // }).then();

    return this._apollo.query({
      query: this.queryTx,
      variables: {
        first: 100,
        skip: page * resultsPerPage,
        orderBy: orderBy,
        orderDirection: orderDirection,
        where: where
      },
    }).pipe(map(r => {
      let info = r.data as any;
      if (info?.orders?.length) {
        return info?.orders as any[];
      }
      return [];
    }));
  }

}
