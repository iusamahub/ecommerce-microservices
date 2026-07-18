import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthModule } from 'angular-auth-oidc-client';
import { authConfig } from './config/auth.config';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, AuthModule.forRoot(authConfig)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
