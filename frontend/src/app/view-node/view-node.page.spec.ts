import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { ViewMessagePageRoutingModule } from './view-node-routing.module';
import { ViewMessagePage } from './view-node.page';

describe('ViewMessagePage', () => {
  let component: ViewMessagePage;
  let fixture: ComponentFixture<ViewMessagePage>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [ViewMessagePage],
      imports: [IonicModule.forRoot(), ViewMessagePageRoutingModule, RouterModule.forRoot([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewMessagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
