import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { SettingsService } from '../../shared/settings.service';
import { TemplateService } from '../../shared/template.service';

declare var Snap: any;

// models and reducers
import { CMSettings } from '../../models/CMSettings';
import { CMStore } from '../../models/CMStore';
import { CMEo } from '../../models/CMEo';
import { CMEl } from '../../models/CMEl';

@Component({
  selector: 'app-tb-templates',
  templateUrl: './tb-templates.component.html',
  styleUrls: ['./tb-templates.component.scss']
})
export class TbTemplatesComponent implements OnInit, AfterViewInit {
  @Input() public cmsettings: CMSettings;
  @ViewChild('tempcmline') public tempcmline;
  @ViewChild('tempcmobject') public tempcmobject;
  public TempCMEo: CMEo;
  public TempCMEl: CMEl;
  public TempCMEoID: number;
  public TempCMElID: number;
  public TempCMEos: CMEo[];
  public TempCMEls: CMEl[];
  public CMEoTextInput = false;
  public CMElTextInput = false;
  public TempSVG = Snap('#templatesvg');
  public newTitle: string;
  public inputStyle: Object;

  constructor(private templateService: TemplateService,
              private store: Store<CMStore>,
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
                this.templateService.tempCMEo
                  .subscribe((data) => {
                    if (data) {
                      // this.deleteTempCMEoSVG();
                      this.TempCMEo = data;
                      // console.log(this.TempCMEo);
                    }
                  });
                this.templateService.tempCMEl
                  .subscribe((data) => {
                    if (data) {
                      // this.deleteTempCMElSVG();
                      this.TempCMEl = data;
                    }
                  });
              }

  public ngOnInit() {

  }

  public ngAfterViewInit() {
    this.TempSVG = Snap('#templatesvg');
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

  // changes template
  public changeTemplate(num: number) {
    if (num === 0) {
      if (this.TempCMEoID) {
        this.templateService.setActiveTempCMEo(this.IDconvert(this.TempCMEoID));
      }
      if (this.TempCMElID) {
        this.templateService.setActiveTempCMEl((this.IDconvert(this.TempCMElID) * -1));
      }
    } else {
      // this.templateService.setActiveTempCMEl(this.IDconvert(this.tempCMEl));
    }
  }

  // removes SVG representation of TempCMEo
  public deleteTempCMEoSVG() {
    if (this.TempSVG) {
      let TempCMEoSVG = this.TempSVG.select('#tempCMEo');
      if (TempCMEoSVG) {
        TempCMEoSVG.selectAll().remove();
      }
    }
  }

  // removes SVG representation of TempCMEl
  public deleteTempCMElSVG() {
    if (this.TempSVG) {
      let TempCMElSVG = this.TempSVG.select('#tempCMEl');
      if (TempCMElSVG) {
        TempCMElSVG.selectAll().remove();
      }
    }
  }

  public clearSVG() {
    if (this.TempSVG) {
      this.TempSVG.clear();
    }
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
    if (this.TempCMEoID) {
      this.templateService.saveCMEo(this.IDconvert(this.TempCMEoID));
    }
    if (this.TempCMElID) {
      this.templateService.saveCMEl((this.IDconvert(this.TempCMElID) * -1));
    }
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
