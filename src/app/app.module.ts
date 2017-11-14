// angular modules
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';
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
import { Toolbar0Component } from './toolbar/toolbar0.component';
import { Widgets0Component } from './widgets/widgets0.component';
import { Widgets1Component } from './widgets/widgets1.component';
import { SButtonComponent } from './shared/s-button/s-button.component';
import { PButtonComponent } from './shared/p-button/p-button.component';
import { LButtonComponent } from './shared/l-button/l-button.component';
import { NumberchangeComponent } from './shared/numberchange/numberchange.component';
import { ColorbarComponent } from './shared/colorbar/colorbar.component';
import { CmobjectComponent } from './cmap/cmobject/cmobject.component';
import { CmlineComponent } from './cmap/cmline/cmline.component';
import { TbFontComponent } from './toolbar/tb-font/tb-font.component';
import { TbLineComponent } from './toolbar/tb-line/tb-line.component';
import { TbNavigationComponent } from './toolbar/tb-navigation/tb-navigation.component';
import { TbTemplatesComponent } from './toolbar/tb-templates/tb-templates.component';
import { TbObjectComponent } from './toolbar/tb-object/tb-object.component';
import { TbSettingsComponent } from './toolbar/tb-settings/tb-settings.component';
import { TbSpecharsComponent } from './toolbar/tb-spechars/tb-spechars.component';

// Services and Reducers
import { LayoutService } from './layout.service';
import { WindowService } from './shared/window.service';
import { SettingsService } from './shared/settings.service';
import { ElementService } from './shared/element.service';
import { TemplateService } from './shared/template.service';
import { EventService } from './shared/event.service';
import { CmlsvgService } from './shared/shapes/cmlsvg.service';
import { CmosvgService } from './shared/shapes/cmosvg.service';
import { SnapsvgService } from './shared/snapsvg.service';
import { settings } from './reducers/settings.reducer';
import { buttons } from './reducers/buttons.reducer';
import { colors } from './reducers/colors.reducer';
import { cmes } from './reducers/cmes.reducer';
import { selectedcmeo } from './reducers/selectedcmeo.reducer';
import { selectedcmel } from './reducers/selectedcmel.reducer';
import { cmeotemplate } from './reducers/cmeotemplate.reducer';
import { cmeltemplate } from './reducers/cmeltemplate.reducer';

@NgModule({
  imports: [
    HttpModule,
    JsonpModule,
    BrowserModule,
    CommonModule,
    NgxElectronModule,
    FormsModule,
    StoreModule.provideStore({ settings: settings,
                               buttons: buttons,
                               colors: colors,
                               cmes: cmes,
                               selectedcmeo: selectedcmeo,
                               selectedcmel: selectedcmel,
                               cmeotemplate: cmeotemplate,
                               cmeltemplate: cmeltemplate}),
    StoreDevtoolsModule.instrumentStore({maxAge: 3})
  ],
  declarations: [ AppComponent,
                  CmapComponent,
                  MenueComponent,
                  ToolbarComponent,
                  Toolbar0Component,
                  Widgets0Component,
                  Widgets1Component,
                  CmlineComponent,
                  CmobjectComponent,
                  CmlineComponent,
                  SButtonComponent,
                  PButtonComponent,
                  LButtonComponent,
                  NumberchangeComponent,
                  ColorbarComponent,
                  TbFontComponent,
                  TbLineComponent,
                  TbTemplatesComponent,
                  TbNavigationComponent,
                  TbObjectComponent,
                  TbSettingsComponent,
                  TbSpecharsComponent],
  providers: [LayoutService,
              WindowService,
              SettingsService,
              EventService,
              CmlsvgService,
              CmosvgService,
              TemplateService,
              SnapsvgService,
              ElementService],
  bootstrap: [ AppComponent ],
})
export class AppModule { }
