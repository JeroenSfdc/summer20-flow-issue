/*
* Author:        SF/JEBU
* Description:   LWC to show a Tile of data
* 				 - @api cardRecord: a single JSON object representing data to be displayed
* 				 - @api fieldName: name of field inside the cardRecord to display
* 				 - @api fieldLabel: label of the field inside the cardRecord
* 				 - @api type: could be either text or currency
* 				 - @api typeAttributes: in case of Currency will hold the field holding the currency code
*
* History:
* 27/01/2020     SF/TLJ Created
*                https://imcdgroup.atlassian.net/browse/SFDP-5817
* 15/05/2020	 SF/JEBU Updated to support Popover
* 				 https://imcdgroup.atlassian.net/browse/SFDP-5987
* 				 SJ/JEBU Updated handling Boolean values
* 				 https://imcdgroup.atlassian.net/browse/SFDP-7074
*/

import {LightningElement, api, track} from 'lwc';

export default class DataCardItemLwc extends LightningElement {

	@api fieldName;
	@api fieldLabel;
	@api type;
	@api typeAttributes;
	@api cardRecord;
	@track _fieldValue;
	@track _showPopover = false;

	get _isCurrency() {
		return this.type === 'currency';
	}

	get _true() {
		return true;
	}

	get _isBoolean() {
		return this.type === 'boolean'
	}

	get _isGeneric() {
		return !this._isBoolean && !this._isCurrency;
	}

	get _currencyCode() {
		return this._isCurrency ?  this.cardRecord [ this.typeAttributes.currencyCode.fieldName ] : '';
	}

	get _booleanValue() {
		return this._isBoolean ? this._fieldValue : false;
	}

	get _minimumFractionDigits () {
		return this.typeAttributes.minimumFractionDigits;
	}

	get _maximumFractionDigits () {
		return this.typeAttributes.maximumFractionDigits;
	}

	connectedCallback() {
		this._fieldValue = this.cardRecord[ this.fieldName ];
	}

	_handleShowPopover() {
		this._showPopover = true;
	}

	_handleHidePopover() {
		this._showPopover = false;
	}

}