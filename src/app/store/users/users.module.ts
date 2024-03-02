import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { UIModule } from '@ui/ui.module';
import { UsersComponent } from './User/users.component';
import { UsersFormComponent } from './UserForm/usersform.component';

@NgModule({
  declarations: [
    UsersComponent,
    UsersFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTablesModule,
    UIModule
  ]
})
export class UsersModule { }
