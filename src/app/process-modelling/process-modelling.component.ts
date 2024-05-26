import {AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import Modeler from 'bpmn-js/lib/Modeler';
import {CovalentFlavoredMarkdownModule} from "@covalent/flavored-markdown";
import {MatButton} from "@angular/material/button";
import {MatDrawer, MatDrawerContainer} from "@angular/material/sidenav";
import {MatIcon} from "@angular/material/icon";
import {MonacoEditorModule} from "ngx-monaco-editor-v2";
import {FormsModule} from "@angular/forms";
import {client} from "fhirclient";
import Client from "fhirclient/lib/Client";
import {MatDialog} from "@angular/material/dialog";
import {ConfigService} from "../config.service";
import {MatCard, MatCardContent, MatCardHeader} from "@angular/material/card";
import {PlanDefinition} from "fhir/r5";
import {HttpClient} from "@angular/common/http";
import {MatTooltip} from "@angular/material/tooltip";
import {NgIf} from "@angular/common";
import {Observable} from "rxjs";
import {saveAs, saveAs as importedSaveAs} from "file-saver";

@Component({
  selector: 'app-process-modelling',
  standalone: true,
  imports: [
    CovalentFlavoredMarkdownModule,
    MatButton,
    MatDrawer,
    MatDrawerContainer,
    MatIcon,
    MonacoEditorModule,
    FormsModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatTooltip,
    NgIf
  ],
  templateUrl: './process-modelling.component.html',
  styleUrl: './process-modelling.component.scss'
})
export class ProcessModellingComponent implements OnInit, AfterViewInit,AfterViewChecked {
  editorOptions = {theme: 'vs-dark', language: 'json'};

  modeler : Modeler | undefined
  data: any;
  bpmnXml: any;

  ctx: Client | undefined

  plan : PlanDefinition = {
    resourceType: "PlanDefinition",
    status : "draft",
    name: "Wound Care",
    actor: [
      {
        title: 'GP',
        option:[
          {
            type:"practitioner"
          }
        ]
      },
      {
        title: 'Community',
        option:[
          {
            type:"healthcareservice"
          }
        ]
      },
      {
        title: 'Pharmacy',
        option:[
          {
            type:"healthcareservice"
          }
        ]
      }
    ],
    action: [
      {
        description: 'Request Wound Care Assessment',
        participant: [
          {
            actorId: "GP"
          }
        ]
      },
      {
        description: 'Perform Wound Care Assessment',
        participant: [
          {
            actorId: "Community"
          }
        ]
      },
      {
        description: 'Create Wound Care Treatment Plan',
        participant: [
          {
            actorId: "Community"
          }
        ]
      },
      {
        description: 'Implement Wound Care Treatment Plan',
        action: [{
          description: 'Request antibiotic medication',
          code: {
            coding:[
              {
                system:'http://hl7.org/fhir/action-code',
                code: 'order-service'
              }
            ]
          },
          participant: [
            {
              actorId: "Community"
            }
          ],
          action: [{
            description: 'Prescribe antibiotic medication',

            participant: [
              {
                actorId: "GP"
              }
            ]
          },
            {
              description: 'Dispense antibiotic medication',
              participant: [
                {
                  actorId: "Pharmacy"
                }
              ]
            }
          ]
        }
        ]
      }
    ]
  }

  @ViewChild('canvas', {static: false}) mydiv: ElementRef | undefined;
  readonly = false;


  constructor(
      public dialog: MatDialog,
      private config: ConfigService,
      private http: HttpClient,
  ) {
  }

  checkType() {

  }

  onInit($event: any) {

  }

  ngOnInit(): void {

    this.ctx = client({
      serverUrl: this.config.sdcServer()
    });

    this.http.get('assets/resources/wound-care.bpmn',{ responseType: "text" }).subscribe(res => {
          this.bpmnXml = res
        },
        (e) => {
          console.log('Error')
          console.log(e)
        });

    this.data = JSON.stringify(this.plan,undefined,2)
  }

  ngAfterViewInit(): void {


    if ( this.mydiv !== undefined) {
     this.bpmnInit()
    }
  }

  bpmnInit() {
    if (this.mydiv !== undefined
        && !this.hasModeler()
        && this.bpmnXml !== undefined) {
      console.log('BPMN Init')
      console.log(this.modeler)
      this.modeler = new Modeler({container: this.mydiv?.nativeElement});


      this.modeler.importXML(this.bpmnXml).then((result) => {

        const { warnings } = result;

        console.log('success !', warnings);

        // @ts-ignore
        this.modeler.get('canvas').zoom('fit-viewport');

      }).catch(function(err) {

        const { warnings, message } = err;

        console.log('something went wrong:', warnings, message);
      });
    }
  }

  ngAfterViewChecked(): void {

    if (this.mydiv !== undefined) {
      this.bpmnInit()
    }
  }

  hasModeler() : boolean{
     if (this.modeler === null || this.modeler === undefined) return false
    return true
  }

  save() {
    if (this.hasModeler()) {
      this.modeler?.saveXML().then((result) => {

        console.log(result);
        const str = result.xml
        if (str !== undefined) {


          const blob = new Blob([str], {type: 'text/xml'});

          saveAs(blob, 'model.bpmn');


        }

      }).catch(function(err) {

        console.log(err);
      });
    }
  }

}
