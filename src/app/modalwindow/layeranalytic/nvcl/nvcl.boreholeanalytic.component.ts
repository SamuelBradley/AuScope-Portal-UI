import { environment } from '../../../../environments/environment';
import { saveAs } from 'file-saver';
import { LayerModel } from '@auscope/portal-core-ui';
import { ManageStateService } from '@auscope/portal-core-ui';
import { UtilitiesService } from '@auscope/portal-core-ui';
import { NVCLBoreholeAnalyticService } from './nvcl.boreholeanalytic.service';
import {
  Component,
  Input,
  AfterViewInit,
  OnInit,
  ViewChild
} from '@angular/core';
import { LayerAnalyticInterface } from '../layer.analytic.interface';
import { NgForm } from '@angular/forms';
import { Observable } from 'rx';

@Component({
  templateUrl: './nvcl.boreholeanalytic.component.html',
  styles: [
    'input:invalid + span:after { content: \'✖\'; color: #f00; padding-left: 15px; }',
    'input:valid + span:after { content: \'✓\'; color: #26b72b; padding-left: 15px;}',
    'select:invalid + span:after { content: \'✖\'; color: #f00; padding-left: 15px; }',
    'select:valid + span:after { content: \'✓\'; color: #26b72b; padding-left: 15px;}'
  ],
  styleUrls: [
    './nvcl.boreholeanalytic.component.css',
    '../../modalwindow.scss'
  ],
  providers: [NVCLBoreholeAnalyticService]
})
export class NVCLBoreholeAnalyticComponent
  implements AfterViewInit, OnInit, LayerAnalyticInterface {
  @ViewChild('f', { static: true }) signupForm: NgForm;
  @Input() layer: LayerModel;
  public nvclform;
  public algorithms;
  public selectedAlgorithm;
  public classifications;
  public isExistingAlgorithm = true;
  public bApplyNvclFilter = true;
  public bPublished = true;

  public ngSelectiveConfig = {};
  public ngSelectiveOptions = [];
  public currentStatus = [];
  public tSGAlgorithmNames = [];
  // VT: object to keep track of the tabpanel
  public UItabpanel = {
    algorithm: true,
    checkprocess: false
  };

  constructor(
    public nvclBoreholeAnalyticService: NVCLBoreholeAnalyticService,
    private manageStateService: ManageStateService
  ) {
    this.nvclform = {};
  }

  ngAfterViewInit(): void {
    this.nvclBoreholeAnalyticService.getNVCLAlgorithms().subscribe(results => {
      this.algorithms = results;
      if (this.nvclBoreholeAnalyticService.hasSavedEmail()) {
        this.nvclform.email = this.nvclBoreholeAnalyticService.getUserEmail();
      }
    });
    this.nvclBoreholeAnalyticService
      .getTSGAlgorithmList()
      .subscribe(results => {
        this.tSGAlgorithmNames = results;
      });
  }

  ngOnInit() {
    this.ngSelectiveConfig = {
      labelField: 'label',
      valueField: 'value',
      maxItems: 5
    };
    this.nvclform.startDepth = 0;
    this.nvclform.endDepth = 9999;
    this.nvclform.operator = 'gt';
    this.nvclform.value = 5;
    this.nvclform.units = 'count';
    this.nvclform.span = 1;
    this.nvclform.ogcFilter = '';
  }

  /**
   * Change the algorithm  and retrieve the associate version
   */
  public changeAlgorithm() {
    this.nvclform.algorithmOutputIds = [];
    this.nvclform.logName = null;
    this.ngSelectiveOptions = [];
    this.nvclform.classifications = null;

    if (this.selectedAlgorithm === 'nsa') {
      return;
    }

    this.nvclform.algorithmOutputIds = [];

    for (const versionlist of this.selectedAlgorithm.versions) {
      this.ngSelectiveOptions.push({
        label: versionlist.version,
        value: versionlist.algorithmOutputId,
        code: versionlist
      });
      this.nvclform.algorithmOutputIds.push(versionlist.algorithmOutputId);
    }
    this.onVersionChange(this.nvclform.algorithmOutputIds);
  }

  /**
   * change the algorithm and get the associated algorithm
   */
  public changeTSGAlgorithm() {
    this.nvclBoreholeAnalyticService
      .getTSGAlgorithm(this.nvclform.tsgAlgName)
      .subscribe(response => {
        this.nvclform.tsgAlgorithm = response;
      });
  }

  /**
   * on version change retrieve the associated classification
   */
  public onVersionChange($event) {
    const algorithmOutputIds = $event;
    if (algorithmOutputIds.length <= 0) {
      return;
    }
    this.nvclBoreholeAnalyticService
      .getNVCLClassifications(algorithmOutputIds)
      .subscribe(classifications => {
        this.classifications = classifications;
      });
  }

  public onSubmit() {
    if (this.bApplyNvclFilter) {
      this.nvclform.ogcFilter = this.layer.ogcFilter;
    } else {
      this.nvclform.ogcFilter = '';
    }
    let jobObserver;
    if (this.isExistingAlgorithm) {
      this.nvclform.algorithm = this.selectedAlgorithm.algorithmId;
      jobObserver = this.nvclBoreholeAnalyticService.submitNVCLAnalyticalJob(this.nvclform, this.layer);
    } else {
      jobObserver =this.nvclBoreholeAnalyticService.submitNVCLTSGModJob(this.nvclform, this.layer);
    }
    jobObserver.subscribe(response => {
      if (response === true) {
        alert('Job has been successfully submitted. The results will be sent to your email.');
        this.nvclBoreholeAnalyticService.setUserEmail(this.nvclform.email);
      }
      },
      err => {
        alert('Failed on the job submission. Please contact cg-admin@csiro.au for help!');
      }
    );
  }

  public checkStatus() {
    this.nvclBoreholeAnalyticService
      .checkNVCLAnalyticalJobStatus(this.nvclform.email)
      .subscribe(response => {
        const me = this;
        me.currentStatus = response;

        me.nvclBoreholeAnalyticService.setUserEmail(me.nvclform.email);
        for (const i in me.currentStatus) {
          me.nvclBoreholeAnalyticService
            .getNVCLJobPublishStatus(me.currentStatus[i].jobid)
            .subscribe(response => {
              me.currentStatus[i].published =
                response === 'true' ? true : false;
            });
        }
      });
  }
  public ChangePublish(status: any) {
    const jobid = status.jobid;
    const published = status.published;
    status.published = !published;
    this.nvclBoreholeAnalyticService
      .publishNvclJob(jobid, !published)
      .subscribe(response => {
        // console.log('jobid=' + jobid + ' publishStatus=' + response);
      });
  }
  public nvclDownload(jobid: string) {
    this.nvclBoreholeAnalyticService
      .downloadNVCLJobResult(jobid)
      .subscribe(response => {
        const blob = new Blob([response], { type: 'application/zip' });
        saveAs(blob, 'nvclAnalytical-jobresult-' + jobid + '.zip');
        this.nvclBoreholeAnalyticService.setUserEmail(this.nvclform.email);
      });
  }

  public nvclDownloadData(jobid: string) {
    this.nvclBoreholeAnalyticService
      .downloadTsgJobData(jobid)
      .subscribe(response => {
        const blob = new Blob([response], { type: 'application/zip' });
        saveAs(blob, 'nvclAnalytical-' + jobid + '.zip');
      });
  }

  public viewOnMap(jobid: string) {
    if (window.confirm('This action will link you to an external URL. Please ensure you have grant access to allow pop up from this domain.')) {
      this.layer.filterCollection.mandatoryFilters[0].value = jobid;
      // Make a state object
      const state = this.manageStateService.generateOneOffState(
        this.layer.id,
        this.layer.filterCollection,
        []
      );
      // Store state object in DB & open up window
      const uncompStateStr = JSON.stringify(state);
      this.manageStateService.saveStateToDB(uncompStateStr).subscribe((response: any) => {
        if (response.success === true) {
          window.open(environment.hostUrl + '?state=' + response.id);
        }
      });
    }
  }
}
