import { Injectable } from '@angular/core';
import { ethers, Signer } from 'ethers';
import { BehaviorSubject, from, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  private _signer?: Signer;

  constructor(_notificationService: NotificationService) {
    try {
      const win: any = window;
      if (!win.ethereum) {
        throw new Error("No web3 wallet, please install Metamask");
      }
      const provider = new ethers.providers.Web3Provider(win.ethereum, "any");
      this._signer = provider.getSigner();

      win.ethereum.on('accountsChanged', (accounts: any) => {
        if (!accounts?.length) {
          // MetaMask is locked or the user has not connected any accounts
          console.log('Please connect to MetaMask.');
        } else if (accounts[0] !== this._account$.value) {
          this._account$.next(accounts[0]);
        }
        console.log(accounts);
      });

      win.ethereum.on("chainChanged", (chainId: any) => { window.location.reload(); });

      from(this._changeNetwork()).subscribe(r => this.connect().subscribe());
    }
    catch (ex: any) {
      console.log(ex);
      _notificationService.showError(ex?.toString());
    }

  }

  private _account$: BehaviorSubject<string> = new BehaviorSubject<string>("");

  // subscribe to account update
  get account$(): Observable<string> {
    return this._account$.asObservable();
  }

  // request connection to metamask
  public connect(): Observable<string[]> {
    return from(this._connect()).pipe(
      tap((address: any) => {
        console.log('address', address);
        if (address.length) {
          this._account$.next(address[0]);
        }
      })
    );
  }

  private async _connect(): Promise<string[]> {
    let win: any = window;
    return await win.ethereum.request({ method: 'eth_requestAccounts' });
  }

  private _goodNetwork(): boolean {
    const chainId = (<any>window).ethereum.networkVersion;
    if (chainId) {
      console.log('chainId', chainId);
      const chainInt = parseInt(chainId);
      const hex = '0x' + chainInt.toString(16);
      return hex.toLocaleLowerCase() === environment.chainId.toLocaleLowerCase();
    }
    return false;
  }

  // request change the network is not the good one selected
  private async _changeNetwork(): Promise<void> {
    if (!this._goodNetwork()) {
      let win: any = window;
      return await win.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: environment.chainId }] });
    }
    return Promise.resolve();
  }

}
