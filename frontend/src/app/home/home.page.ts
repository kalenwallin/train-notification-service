import { Component, OnInit, inject } from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';
import { AlertController, ToastController } from '@ionic/angular';

import { DataService, Node } from '../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  private data = inject(DataService);
  public nodes: Node[] = [];

  constructor(private alertController: AlertController, private toastController: ToastController) {}

  async ngOnInit() {
    this.data.fetchNodes();
    this.data.startPolling();
  }

  refresh(ev: any) {
    setTimeout(() => {
      (ev as RefresherCustomEvent).detail.complete();
    }, 3000);
  }

  getNodes(): void {
    this.nodes = this.data.getNodes();
  }

  isFavoriteNode(id: number) {
    return this.data.isFavoriteNode(id);
  }

  async toggleNode(id:number) {
    this.data.toggleFavoriteNode(id);

    const alert = await this.toastController.create({
      message: 'Crossings updated!',
      duration: 3000,
      position: 'bottom'

    });

    await alert.present();
  }

  updateLocation($event: any) {
    this.getNodes();

  }

  async getNotification() {
    const alert = await this.alertController.create({
      header: 'Train A\'comin!',
      message: 'A train has been detected that you cared about.',
      buttons: ['Okied Dokie'],
    });

    await alert.present();
  }
}
