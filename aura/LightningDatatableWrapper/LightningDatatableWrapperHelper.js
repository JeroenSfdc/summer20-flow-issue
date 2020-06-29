({
	identifyObject: function(component) {
		var lstObjects = component.get("v.sObjects");

		for (var index = 0; index < lstObjects.length; index++) {
			var sObject = component.get("v.IN_" + lstObjects[index]);
			if (sObject.length > 0) {
				component.set("v.IN_sObject", "IN_" + lstObjects[index]);
				component.set("v.OUT_sObject", "OUT_" + lstObjects[index] );
				break;
			}
		}
	}
	, returnNoData: function (component) {
		component.set("v.columns", [{label: 'Message', fieldName: 'nodata', type: 'text'}]);
		component.set("v.data", [{"nodata":"No data found."}]);
		component.set("v.hideCheckboxColumn", "TRUE");
	}
	, setDataAttribute: function(component) {
		var sObject = component.get("v.IN_sObject");
		component.set("v.data", component.get("v." + sObject));

		// workaround for 'cannot read sObject' error for certain standard object like case
		// See details here https://sforce.co/2Tkqih8
		// Explicity set the sobjectType attribute for the first record
		// v.data[0] is being passsed into the getSObjectColumns method on the Apex controller

		var thisData = component.get("v.data");
		thisData[0].sobjectType = sObject.substr(3); // removes leading 'IN_'

		var flattenedObject = this.flattenQueryResult(thisData);
		component.set("v.data", flattenedObject);
	}
	, setOutput: function(component, setRows) {
		var sObject = component.get("v.OUT_sObject");
		component.set("v." + sObject, setRows);
		console.log("[LightningDataWrapperController][setOutput] v." + sObject + " copied with selected rows");
		console.table(setRows);
	}
	, showToast: function(component, message) {
		component.find('notifLib').showToast({
			"variant": "success"
			, "mode": "pester"
			, "message": message
		});
	}
	, filterDataHelper: function(component, event, helper) {
		var data = component.get("v.backingData"),
			term = component.get("v.filter"),
			results = data, regex;
		try {
			regex = new RegExp(term, "i");
			results = data.filter(row => regex.test(JSON.stringify(row)));
		}
		catch (e) {
			// invalid regex, use full list
		}
		component.set("v.data", results);
		component.find("datatable").set("v.selectedRows", component.get("v.selectedRowIds"));
	}
	, setPreselectedRows: function(component) {
		let datatable = component.find("datatable");
		let selectedRowIds = component.get("v.selectedRowIds")
		let selectedRows = []; // init with empty list (default on comp does not seem to work, Flow will otherwise receive [null]
		let inputRows = component.get("v.data");

		if (Array.isArray(selectedRowIds) && selectedRowIds[0]) {
			datatable.set("v.selectedRows", selectedRowIds);
			component.set("v.hasSelectedRows", true);
			selectedRows = inputRows.filter(row => selectedRowIds.indexOf(row.Id) >= 0);
		}

		this.setOutput(component, selectedRows);
	}
	, flattenObject : function(propName, obj) {
		var flatObject = [];

		for(var prop in obj)
		{
			//if this property is an object, we need to flatten again
			var propIsNumber = isNaN(propName);
			var preAppend = propIsNumber ? propName+'_' : '';
			if(typeof obj[prop] == 'object')
			{
				flatObject[preAppend+prop] = Object.assign(flatObject, this.flattenObject(preAppend+prop,obj[prop]) );

			}    
			else
			{
				flatObject[preAppend+prop] = obj[prop];
			}
		}
		return flatObject;
	}
	
	, flattenQueryResult : function(listOfObjects) {
		if(!Array.isArray(listOfObjects))
		{
			var listOfObjects = [listOfObjects];
		}

		var listOfFlattenedObjects = [];

		console.log('List of Objects is now....');
		console.log(listOfObjects);
		for(var i = 0; i < listOfObjects.length; i++)
		{
			var obj = listOfObjects[i];
			for(var prop in obj)
			{      
				if(!obj.hasOwnProperty(prop)) continue;
				if(Array.isArray(obj[prop]))
				{
					for(var j = 0; j < obj[prop].length; j++)
					{
						obj[prop+'_'+j] = Object.assign(obj,this.flattenObject(prop,obj[prop]));
					}
				}
				else if(typeof obj[prop] == 'object')
				{
					obj = Object.assign(obj, this.flattenObject(prop,obj[prop]));
				}

			}
			listOfFlattenedObjects.push(obj);
		}
		return listOfFlattenedObjects;
	}
})