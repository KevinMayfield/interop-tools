import {Component, ElementRef, SecurityContext, ViewChild} from '@angular/core';
import {InfoDiaglogComponent} from "../info-diaglog/info-diaglog.component";
import {ConfigService} from "../config.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {DomSanitizer} from "@angular/platform-browser";
import {TdDialogService} from "@covalent/core/dialogs";
import {ActivatedRoute} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentComponent {
  editorOptions = {theme: 'vs-dark', language: 'json'};
  monacoEditor: any
  @ViewChild('myFormContainer', {static: false}) mydiv: ElementRef | undefined;
  data: any;

  markdown: string = "See [FHIR Document](https://hl7.org/fhir/R4/documents.html), [Internation Patient Summary](https://build.fhir.org/ig/HL7/fhir-ips/index.html) and [HL7 Europe Laboratory Report](https://build.fhir.org/ig/hl7-eu/laboratory/)."
  html = "<html>Copy FHIR document into editor</html>"
  resource: any;

  constructor(private config: ConfigService,
              private http: HttpClient,
              private _dialogService: TdDialogService,
              protected sanitizer: DomSanitizer,
              private route: ActivatedRoute,
              public dialog: MatDialog
  ) {
  }

  checkType() {
    this.resource = JSON.parse(this.data)
  }

  onInit($event: any) {
    
  }

  openInfo() {
    let dialogRef = this.dialog.open(InfoDiaglogComponent, {
      width: '400px',
      data:  this.markdown
    });

  }

  convertXML() {

    let headers = new HttpHeaders(
    );
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Accept', 'text/html');
    var url: string = this.config.validateUrl() + '/Composition/$convert';
    this.http.post(url, this.data,{ responseType: 'text', headers}).subscribe(xmlString => {
         this.html= xmlString
        },
        error => {

          console.log(JSON.stringify(error))
          this._dialogService.openAlert({
            title: 'Alert',
            disableClose: true,
            message:
                this.config.getErrorMessage(error),
          });
        })
  }

  showDocument() {
      if (this.resource !== undefined) {
         this.convertXML()
      }
  }
}
