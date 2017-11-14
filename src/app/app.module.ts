// angular modules
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
//  mport { ColorPickerService } from 'ct-angular2-color-picker/component'; , [ColorPickerService]
// import { Routes, RouterModule } from '@angular/router';

// Components
import { AppComponent } from './app.component';
import { CmapComponent } from './cmap/cmap.component';
import { MenueComponent } from './menue/menue.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { WidgetsComponent } from './widgets/widgets.component';
import { SButtonComponent } from './shared/s-button/s-button.component';
import { PButtonComponent } from './shared/p-button/p-button.component';
import { NumberchangeComponent } from './shared/numberchange/numberchange.component';
import { ColorbarComponent } from './shared/colorbar/colorbar.component';
import { CmobjectComponent } from './cmap/cmobject/cmobject.component';
import { CmlineComponent } from './cmap/cmline/cmline.component';
import { CmmarkerComponent } from './cmap/cmmarker/cmmarker.component';
import { CmcontentComponent } from './cmap/cmobject/cmcontent/cmcontent.component';
import { TbFontComponent } from './toolbar/tb-font/tb-font.component';
import { TbLineComponent } from './toolbar/tb-line/tb-line.component';
import { TbNavigationComponent } from './toolbar/tb-navigation/tb-navigation.component';
import { TbObjectComponent } from './toolbar/tb-object/tb-object.component';
import { TbSettingsComponent } from './toolbar/tb-settings/tb-settings.component';

// Services and Reducers
import { LayoutService } from './layout.service';
import { WindowService } from './shared/window.service';
import { SettingsService } from './shared/settings.service';
import { ElementService } from './shared/element.service';
import { EventService } from './shared/event.service';
import { CmlsvgService } from './shared/shapes/cmlsvg.service';
import { CmosvgService } from './shared/shapes/cmosvg.service';
import { SnapsvgService } from './shared/snapsvg.service';
import { elements } from './reducers/elements.reducer';
import { buttons } from './reducers/buttons.reducer';
import { colors } from './reducers/colors.reducer';
import { settings } from './reducers/settings.reducer';
import { selectedElement } from './reducers/selectedelement.reducer';


@NgModule({
  imports: [
    HttpModule,
    JsonpModule,
    BrowserModule,
    CommonModule,
    FormsModule,
    StoreModule.provideStore({ elements: elements, selectedElement, settings, buttons, colors}),
    StoreDevtoolsModule.instrumentOnlyWithExtension()
  ],
  declarations: [ AppComponent,
                  CmapComponent,
                  MenueComponent,
                  ToolbarComponent,
                  WidgetsComponent,
                  CmlineComponent,
                  CmobjectComponent,
                  CmmarkerComponent,
                  CmobjectComponent,
                  CmlineComponent,
                  CmcontentComponent,
                  SButtonComponent,
                  PButtonComponent,
                  NumberchangeComponent,
                  ColorbarComponent,
                  TbFontComponent,
                  TbLineComponent,
                  TbNavigationComponent,
                  TbObjectComponent,
                  TbSettingsComponent],
  providers: [LayoutService,
              WindowService,
              SettingsService,
              EventService,
              CmlsvgService,
              CmosvgService,
              SnapsvgService,
              ElementService],
  bootstrap: [ AppComponent ],
})
export class AppModule { }
