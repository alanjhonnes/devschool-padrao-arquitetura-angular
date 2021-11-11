import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export const sharedComponents = []

export const sharedModules = [
  CommonModule,
  ReactiveFormsModule,
  FormsModule,
  MatButtonModule,
  MatOptionModule,
  MatSelectModule,
  MatFormFieldModule,
  MatIconModule,
  MatTabsModule,
  MatRadioModule,
  MatInputModule,
  MatProgressSpinnerModule,
]

@NgModule({
  declarations: [
    ...sharedComponents,
  ],
  imports: [
    ...sharedModules,
  ],
  exports: [
    ...sharedModules,
    ...sharedComponents,
  ]
})
export class SharedModule { }
