import { Injectable } from '@angular/core';
import { ethers, Signer } from 'ethers';
import { BehaviorSubject, from, Observable, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  private _loading$: Subject<boolean> = new Subject<boolean>();

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  setLoading(value: boolean) {
    this._loading$.next(value);
  }


  constructor() {
  }



}
