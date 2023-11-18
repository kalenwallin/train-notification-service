import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewNodePage } from './view-node.page';

import { IonicModule } from '@ionic/angular';

import { ViewNodePageRoutingModule } from './view-node-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewNodePageRoutingModule
  ],
  declarations: [ViewNodePage]
})
export class ViewNodePageModule {}
