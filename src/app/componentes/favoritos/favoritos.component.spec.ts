import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoritosComponent } from './favoritos.component';

describe('FavoritosComponent', () => {
  let component: FavoritosComponent;
  let fixture: ComponentFixture<FavoritosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FavoritosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoritosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
