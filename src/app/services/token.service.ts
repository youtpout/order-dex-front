import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';
import { from, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BaseContract, BigNumber, ethers } from 'ethers';
import { OrderDexTokenInterface } from 'src/typechain-types/contracts/OrderDexToken';
import { ERC20, ERC20__factory, OrderDexToken, OrderDexToken__factory } from 'src/typechain-types';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  _signer: any;
  _contract: OrderDexToken;
  _webprovider?: ethers.providers.Web3Provider;
  oneToken: BigNumber = ethers.utils.parseUnits("1", 18);
  maxUint256: BigNumber = (BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));

  constructor() {
    const win: any = window;

    this._contract = new ethers.Contract(environment.contractAddress, OrderDexToken__factory.abi) as OrderDexToken;
    if (win.ethereum) {
      this._webprovider = new ethers.providers.Web3Provider(win.ethereum, "any");
      this._signer = this._webprovider.getSigner();
      this._contract = new ethers.Contract(environment.contractAddress, OrderDexToken__factory.abi, this._signer) as OrderDexToken;
    }
  }


  getBalance(tokenAddress: string, address: string): Observable<number> {
    if (tokenAddress === environment.wmaticAddress && this._webprovider) {
      return from(this._webprovider.getBalance(address)).pipe(map(r => parseFloat(ethers.utils.formatUnits(r, 18))));
    }
    const token = new ethers.Contract(tokenAddress, ERC20__factory.abi, this._signer) as ERC20;
    return from(token.balanceOf(address)).pipe(map(r => parseFloat(ethers.utils.formatUnits(r, 18))));
  }

  async addToken(): Promise<any> {
    const win: any = window;
    if (win.ethereum) {
      const wasAdded = await win.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: environment.tokenAddress, // The address that the token is at.
            symbol: "ODT", // A ticker symbol or shorthand, up to 5 chars.
            decimals: 18, // The number of decimals in the token
          },
        },
      });
    }
  }

  getAllowance(tokenAddress: string, account: string): Observable<BigNumber> {
    const token = new ethers.Contract(tokenAddress, ERC20__factory.abi, this._signer) as ERC20;
    console.log("tokenAddress", tokenAddress, account);
    return from(token.allowance(account, environment.contractAddress));
  }

  approve(tokenAddress: string): Observable<any> {
    return from(this.approveToken(tokenAddress));
  }

  async approveToken(tokenAddress: string): Promise<any> {
    const token = new ethers.Contract(tokenAddress, ERC20__factory.abi, this._signer) as ERC20;
    let tx = await token.approve(environment.contractAddress, this.maxUint256);
    await tx.wait();
  }

}
