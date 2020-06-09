import {LightningElement, api} from 'lwc';
import {FlowAttributeChangeEvent} from 'lightning/flowSupport';

export default class FlowLwcComp extends LightningElement {
   @api inputString;
   @api selectedValue;

   renderedCallback() {
   }

   _copyInputToOutput() {
      this.selectedValue = this.inputString;
      const attributeChangeEvent1 = new FlowAttributeChangeEvent('selectedValue', this.inputString);
      this.dispatchEvent(attributeChangeEvent1);
   }
}