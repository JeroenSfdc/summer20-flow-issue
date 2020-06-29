({
	init: function (component, event, helper) {
		helper.identifyObject(component); // sets the v.IN_sObject / v.OUT_sObject value providers

		// In case no data available, return an empty object
		if (component.get("v.IN_sObject") === undefined) {
			helper.returnNoData(component);
			return;
		}

		component.set("v.data", component.get("v.IN_sObject"));

		helper.setDataAttribute(component); // copies IN_xxx value provider to v.data
		helper.setPreselectedRows(component); // if selectedRowIds contains list of Ids, these will be auto-selected.
		component.set("v.backingData", component.get("v.data")); // backingData used exclusively for searching

		var action = component.get("c.getSObjectColumns");

		action.setParams({"genericSObject": component.get("v.data")[0]
			,"hideIdField": component.get("v.hideIdField") // hide id fields
			,"hideReferenceFields": component.get("v.hideReferenceFields") // hide relationship field
			,"lstField": component.get("v.fieldList") // optional list of fields (otherwise sobject will be inspected only)
		}); // needs to use v.data object
		action.setCallback(this, function(response) { //Includes the function with a response
			var state = response.getState();
			if(component.isValid() && state === "SUCCESS"){ //Only look for SUCCESS, no error handling
				component.set("v.columns", JSON.parse(response.getReturnValue()));
				console.table(JSON.parse(response.getReturnValue()));
			}
			else {
				console.error(JSON.stringify(response.getError()));
			}
		});
		$A.enqueueAction(action); //Tell lightning framework to take care of the action
	}
	, updateSelectedRows: function(component, event, helper) {
		var sObject = component.get("v.OUT_sObject");
		var selectedRows = event.getParam("selectedRows");
		var selectedRowIds = [];
		var setRows = [];

		for (var i = 0; i < selectedRows.length; i++){
			delete selectedRows[i].sobjectType; // remove the sobjecttype attribute
			setRows.push(selectedRows[i]);
			selectedRowIds.push(selectedRows[i].Id);
		}

		helper.setOutput(component, setRows); // copies setRows to OUT_xxx
		if (component.get("v." + sObject).length > 0) {
			component.set("v.hasSelectedRows", true);
			component.set("v.selectedRowIds", selectedRowIds);

		} else {
			component.set("v.hasSelectedRows", false);
		}

		// In case maxRowSelection == 1 (radio button) and record selected set selectedRowId
		if (setRows.length == 1 && component.get("v.maxRowSelection") == 1)
			component.set("v.selectedRowId", setRows[0].Id);
		else
			component.set("v.selectedRowId", "");
	}
	, filterData: function (component, event, helper) {
		helper.filterDataHelper(component, event, helper);
	}
	, addSelection: function (component, event, helper) {
		let datatable = component.find("datatable");
		let selectedRows = new Set(datatable.get("v.selectedRows"));
		let allSelectedRows = new Set(component.get("v.selectedRowIds"));
		selectedRows.forEach(key => allSelectedRows.add(key));
		component.set("v.selectedRowIds", Array.from(allSelectedRows));
		datatable.set("v.selectedRows", component.get("v.selectedRowIds"));
		component.set("v.filter", ""); // reset full-text search field
		helper.filterDataHelper(component, event, helper); // reset filter logic
		helper.setOutput(component, datatable.getSelectedRows()); // copies setRows to OUT_xxx
		helper.showToast(component, selectedRows.size + ' records have been added to your selection.');

	}
	, resetSelection: function (component, eventh, helper) {
		component.find("datatable").set("v.selectedRows", []);
		component.set("v.selectedRowIds", []);
		component.set("v.hasSelectedRows", false);        
		helper.showToast(component, 'Your selections have been reset.');
	}
})