import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()
export class LayoutService {
  constructor(private http: Http) { }

  // reads data from JSON-File
  getLayout() {
    return this.http.get('./assets/config/layout.json')
        .map((response: Response) => response.json());
  }

}
