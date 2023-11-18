import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewNodePage } from './view-node.page';

const routes: Routes = [
  {
    path: '',
    component: ViewNodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewNodePageRoutingModule {}
