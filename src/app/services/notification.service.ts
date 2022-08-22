import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) { }

  showSuccess(message: string): void {
    this.snackBar.open(message, '', {
      duration: 8000,
      panelClass: 'snackbar-notification-success',
      verticalPosition: 'bottom',
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, '', {
      duration: 8000,
      panelClass: 'snackbar-notification-error',
      verticalPosition: 'bottom',
    });
  }

  showWarning(message: string): void {
    this.snackBar.open(message, '', {
      duration: 8000,
      panelClass: 'snackbar-notification-warning',
      verticalPosition: 'bottom',
    });
  }

  show(message: string): void {
    this.snackBar.open(message, '', {
      duration: 8000,
      panelClass: 'snackbar-notification-notify',
      verticalPosition: 'bottom',
    });
  }
}
