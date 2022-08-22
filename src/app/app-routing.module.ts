import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistoryComponent } from './history/history.component';
import { HomeComponent } from './home/home.component';
import { OrderComponent } from './order/order.component';


const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/order/matic-odt' },
  {
    path: 'order', component: HomeComponent, children: [{
      path: ':pair', component: OrderComponent,
    }]
  },
  { path: 'history', component: HistoryComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
