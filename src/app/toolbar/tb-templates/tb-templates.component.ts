import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { SettingsService } from '../../shared/settings.service';
import { TemplateService } from '../../shared/template.service';

declare var Snap: any;

// models and reducers
import { CMSettings } from '../../models/CMSettings';
import { CMEo } from '../../models/CMEo';
import { CMEl } from '../../models/CMEl';

@Component({
  selector: 'app-tb-templates',
  templateUrl: './tb-templates.component.html',
  styleUrls: ['./tb-templates.component.scss']
})
export class TbTemplatesComponent implements OnInit, AfterViewInit {
  @Input() public cmsettings: CMSettings;
  public tempCMEo: number;
  public tempCMEl: number;
  public TempCMEos: CMEo[];
  public TempCMEls: CMEl[];
  public CMEoTextInput = false;
  public CMElTextInput = false;
  public newTitle: string;
  public inputStyle: Object;

  constructor(private templateService: TemplateService,
              private settingsService: SettingsService) {
                this.templateService.getTemplates();
                this.TempCMEos = this.templateService.getTempCMEos();
                this.TempCMEls = this.templateService.getTempCMEls();
                this.settingsService.cmsettings
                      .subscribe((data) => {
                        if (data) {
                          this.cmsettings = data;
                        }
                      });
              }

  public ngOnInit() {

  }

  public ngAfterViewInit() {
  }

  // changes mode in settings
  public changeMode(selector: string) {
    if (this.cmsettings.mode === selector && this.cmsettings.mode !== 'edit') {
      this.cmsettings.mode = 'edit';
    } else {
      this.cmsettings.mode = selector;
    }
    // console.log(this.cmsettings);
    this.settingsService.updateSettings(this.cmsettings);
  }

  // changes peersistence mode in settings
  public changePersistance() {
    if (this.cmsettings.cngtemp) {
      this.cmsettings.cngtemp = false;
    } else {
      this.cmsettings.cngtemp = true;
    }
    // console.log(this.cmsettings);
    this.settingsService.updateSettings(this.cmsettings);
  }

  // mark selection
  public persistanceStyle() {
    if (this.cmsettings.cngtemp) {
      let style: Object = {'background-color': '#ff0000'};
      // console.log('selectionStyle: ', style);
      return style;
    } else {
      let style: Object = {'background-color': '#ffffff'};
      return style;
    }
  }

  // changes template
  public changeTemplate(num: number) {
    if (num === 0) {
      this.templateService.setActiveTempCMEo(this.IDconvert(this.tempCMEo));
      this.templateService.setActiveTempCMEl((this.IDconvert(this.tempCMEo) * -1));
    } else {
      // this.templateService.setActiveTempCMEl(this.IDconvert(this.tempCMEl));
    }
  }

  public clearSVG() {
    let stb = Snap('#templatesvg');
    stb.clear();
  }

  // mark selection
  public selectionStyle(selector) {
    if (this.cmsettings.mode === selector) {
      let style: Object = {
        'background-color': '#ffaaaa',
        'size': '16px'
      };
      // console.log('selectionStyle: ', style);
      return style;
    } else {
      let style: Object = {
        'background-color': '#ffffff',
        'size': '16px'
      };
      return style;
    }
  }

  // saves changes on template in database
  public saveCME() {
    this.templateService.saveCMEo(this.IDconvert(this.tempCMEo));
    this.templateService.saveCMEl((this.IDconvert(this.tempCMEo) * -1));
  }

  // saves changes on template in database
  public newTemplate(title: string, ident: string) {
    console.log(title, ident);
    if (ident === 'cmo') {
      this.CMEoTextInput = false;
      this.templateService.newCMEo(title);
      this.TempCMEos = this.templateService.getTempCMEos();
      this.TempCMEls = this.templateService.getTempCMEls();
    } else {
      this.CMElTextInput = false;
    }
  }

  // changes textInput enables saving
  public setInput(ident: string) {
    this.templateService.useSelectedCME();
    /*
    if (ident === 'cmo') {
      this.CMEoTextInput = true;
    } else {
      this.CMElTextInput = true;
    }*/
  }

  public IDconvert(idstr) {
    if (typeof idstr !== 'number') {
      if (idstr.indexOf('-') === -1) {
        let idres = idstr.slice(idstr.indexOf('.') + 1);
        let int = parseInt(idres, 10);
        let id = int / Math.pow(10, idres.length);
        return id;
      } else {
        let idres = idstr.slice(idstr.indexOf('.') + 1);
        let int = parseInt(idres, 10);
        let id = (-1) * (int / Math.pow(10, idres.length));
        return id;
      }
    } else {
      return idstr;
    }
  }

}
