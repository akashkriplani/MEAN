import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material.module';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

@NgModule({
  imports: [
    AngularMaterialModule,
    CommonModule,
    FormsModule,
  ],
  declarations: [
    LoginComponent,
    SignupComponent
  ]
})
export class AuthModule {}
