/*
* Author:        SF/TLJ, SF/JEBU
* Description:   Creation of data card list for the mobile app (form factor = small)
*                Used to show a mobile presentation of a list of records
*                - Can be used from a flow (using lstxxxx for relevant SObject + optionally lstSelectedxxx to pre-select records)
*                - Can be used as composition (using lstGenericRecords + columnsObject)
* History:
* 28/01/2020     SF/TLJ Created
*                https://imcdgroup.atlassian.net/browse/SFDP-5817
*
*/

import { LightningElement, api, track } from 'lwc';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
import getSObjectColumns from '@salesforce/apex/LightningDatatableWrapperCompController.getSObjectColumns';

export default class DataCardListLwc extends LightningElement {

    @api fieldList = [];                // input: list of field names assigned from flow (Generic)

    @api lstQuoteLine = [];             // Input: list of Quote Line records assigned from flow (Quote Line specific)
    @api lstSelectedQuoteLine = [];     // Both input/output (Quote Line specific)

    @api lstOpportunity = [];           // Input: list of Opportunity records assigned from flow (Opportunity specific)
    @api lstSelectedOpportunity = [];   // Both input/output (Opportunity specific)

    @api lstCase = [];                  // Input: list of Case records assigned from flow (Case specific)
    @api lstSelectedCase = [];          // Both input/output (Case specific)

    @api lstVisitReport = [];                  // Input: list of Visit Report records assigned from flow (Visit Report specific)
    @api lstSelectedVisitReport = [];          // Both input/output (Visit Report specific)

    @api lstAccountContactRelation = [];           // Input: list of AccountContactRelation records assigned from flow (AccountContactRelation specific)
    @api lstSelectedAccountContactRelation = [];   // Both input/output (AccountContactRelation specific)

    @api lstAccountShiptoAddress = [];           // Input: list of AccountShiptoAddress__c records assigned from flow (AccountShiptoAddress__c specific)
    @api lstSelectedAccountShiptoAddress = [];   // Both input/output (AccountShiptoAddress__c specific)

    @api lstProduct2 = [];              // Input: list of Product2 records assigned from flow (Product2 specific)
    @api lstSelectedProduct2 = [];      // Both input/output (Product2 specific)

    @api lstAdditionalTeamMember = [];           // Input: list of AdditionalTeamMember records assigned from flow (AdditionalTeamMember__c specific)
    @api lstSelectedAdditionalTeamMember = [];   // Both input/output (AdditionalTeamMember__c specific)

    @api maxRowSelection = 999;         //Input: Maximum number of items the user is allow to select
    @api selectedRecordId = '';         // Output: Id of selected record/row from flow (Generic)
    @api hasSelectedRows;               // Check if a user has selected at least one record
    @api keyField;                      // Optionally provide the key of the list (when providing @api lstGenericRecords)
    @api columnsObject;                 // ColumnsObject received from the LightningDatatableWrapperCompController

    @track _loaded = false;             // To toggle spinner
    @track _lstRecords = [];            // Local property (copy of either lstGenericRecords or lstxxxx)
    @track _lstSelectedRecords = [];    // Local property (copy of lstSelectedxxxxx)
    @track _lstGenericRecords = [];     // private property, related with public property 'lstGenericRecords'
    _returnProperty = '';

    @api                                // public property able to receive a list of non-sobject records.
    get lstGenericRecords() {
        return this._lstGenericRecords;
    }
    set lstGenericRecords(value) {
        this._lstGenericRecords = value;
        this._initRecordList();
    }

    connectedCallback () {
        this._initRecordList();
        this.maxRowSelection = parseInt(this.maxRowSelection);
    }

    renderedCallback() {
        // This sets the Checked attribute for the selected records
        if (this._lstSelectedRecords.length > 0){
            for (let i = 0; i < this._lstSelectedRecords.length; i++ ){
                this.template.querySelectorAll('[data-element="checkbox-button"]').forEach(element => {
                     if (element.getAttribute('data-id') === this._lstSelectedRecords[i].Id) {
                          element.checked=true;
                      }
                });
            }
            this._updateFlow(this._lstSelectedRecords.length === 1 ? this._lstSelectedRecords[0].Id : '');
        }
    }                                                                                                                                   
                                                                                                                                        
    _initRecordList() {
        if (this.lstQuoteLine.length > 0) {
            this._lstRecords = this.lstQuoteLine;
            this._lstSelectedRecords = this.lstSelectedQuoteLine;
            this._returnProperty = 'lstSelectedQuoteLine';
        }
        if (this.lstOpportunity.length > 0) {
            this._lstRecords = this.lstOpportunity;
            this._lstSelectedRecords = this.lstSelectedOpportunity;
            this._returnProperty = 'lstSelectedOpportunity';
        }
        if (this.lstCase.length > 0) {
            this._lstRecords = this.lstCase;
            this._lstSelectedRecords = this.lstSelectedCase;
            this._returnProperty = 'lstSelectedCase';
        }
        if (this.lstVisitReport.length > 0) {
            this._lstRecords = this.lstVisitReport;
            this._lstSelectedRecords = this.lstSelectedVisitReport;
            this._returnProperty = 'lstSelectedVisitReport';
        }
        if (this.lstAccountContactRelation.length > 0) {
            this._lstRecords = this.lstAccountContactRelation;
            this._lstSelectedRecords = this.lstSelectedAccountContactRelation;
            this._returnProperty = 'lstSelectedAccountContactRelation';
        }
        if (this.lstAccountShiptoAddress.length > 0) {
            this._lstRecords = this.lstAccountShiptoAddress;
            this._lstSelectedRecords = this.lstSelectedAccountShiptoAddress;
            this._returnProperty = 'lstSelectedAccountShiptoAddress';
        }
        if (this.lstProduct2.length > 0) {
            this._lstRecords = this.lstProduct2;
            this._lstSelectedRecords = this.lstSelectedProduct2;
            this._returnProperty = 'lstSelectedProduct2';
        }
        if (this.lstAdditionalTeamMember.length > 0) {
            this._lstRecords = this.lstAdditionalTeamMember;
            this._lstSelectedRecords = this.lstSelectedAdditionalTeamMember;
            this._returnProperty = 'lstSelectedAdditionalTeamMember';
        }
        if (this.lstGenericRecords.length > 0) {
            this._lstRecords = this.lstGenericRecords;
            if (typeof this._lstRecords[0].Id === "undefined") { // If the 'Id' is not provided...
                this._lstRecords = this._lstRecords.map(obj => ({...obj, Id: obj[ this.keyField ]})); // add the provided key to the list
            }
        }

        // take the first row and put it into the _sObject property
        if (this._lstRecords.length > 0 && this.lstGenericRecords.length === 0) {
            this._getColumnObject();
        }
        else if (this._lstRecords.length === 0 && this.lstGenericRecords.length === 0) {
            console.error('Received list of records empty.');
        }

        this._loaded = true;
    }

    get _showAllSelect() {
        return this.maxRowSelection > 1 ? true : false;
    }

    get _showSelect() {
        return this.maxRowSelection > 0 ? true : false;
    }

    _getColumnObject() {
        getSObjectColumns({
            genericSObject:  this._sObject = this._lstRecords[0], // push the first records from list (used by Apex)
            lstField: this.fieldList,
            hideIdField: true,
            hideReferenceFields: true
        })
            .then(result => {
                this.columnsObject = JSON.parse(result);
            })
            .catch(error => {
                console.error(error);
            });
    }

    get _isKeyId() {
        return this.key === 'Id';
    }

    _handleSelect (event) {
        let recordId = event.target.getAttribute('data-id');

        // If user multiple selections are allowed
        if (event.target.checked && this.maxRowSelection > 1) {
            // https://salesforce.stackexchange.com/questions/252996/array-push-wont-update-lightning-web-component-view
            // add selected record to list of selected records
            this._lstSelectedRecords = [...this._lstSelectedRecords, this._getRecord(recordId)[0]];
        }
        // If user only one selection is allowed deselect the others
        else if (event.target.checked && this.maxRowSelection === 1){
            this._lstSelectedRecords = [...this._getRecord(recordId)];
            this._selectiveDeselect(recordId);
        }
        else {
            // remove selected record from selected records
            this._lstSelectedRecords = this._lstSelectedRecords.filter(record => { if (record.Id !== recordId) return record;});
            this._lstSelectedRecords = [...this._lstSelectedRecords];
        }
        this._updateFlow(recordId);
    }

    _handleSelectAll (event) {
        if (event.target.checked) {
            // https://salesforce.stackexchange.com/questions/252996/array-push-wont-update-lightning-web-component-view
            this._lstSelectedRecords = [...this._lstRecords];
            this._setChecked(true);

        }
        else {
            this._lstSelectedRecords = [];
            this._setChecked(false);
        }

        this._updateFlow(this._lstSelectedRecords.length === 1 ? this._lstSelectedRecords[0].Id : '');

    }

    _getRecord (recordId) {
        return this._lstRecords.filter(record => { if (record.Id === recordId) return record; });
    }

    _setChecked(value) {
        this.template.querySelectorAll('[data-element="checkbox-button"]').forEach(element => { element.checked=value;});
    }

    _selectiveDeselect(recordId){
        // Deselect all checkboxes except the checkbox identified by the recordId
        this.template.querySelectorAll('[data-element="checkbox-button"]').forEach(element => {
            if (element.getAttribute('data-id') !== recordId) {
                element.checked=false;
            }
        })
    }

    // If record selection is possible, propagate back to flow.
    _updateFlow(recordId) {
        if ( this._showAllSelect || this._showSelect ) {
            const attributeChangeEvent1 = new FlowAttributeChangeEvent(this._returnProperty, this._lstSelectedRecords);
            const attributeChangeEvent2 = new FlowAttributeChangeEvent('hasSelectedRows', this._lstSelectedRecords.length > 0 ? true : false);
            const attributeChangeEvent3 = new FlowAttributeChangeEvent('selectedRecordId', this._lstSelectedRecords.length === 1 ? recordId : '');
            this.dispatchEvent(attributeChangeEvent1);
            this.dispatchEvent(attributeChangeEvent2);
            this.dispatchEvent(attributeChangeEvent3);
        }
    }
}