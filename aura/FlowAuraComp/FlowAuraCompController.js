({
    init: function (component, event, helper) {
    }
    , _copyInputToOutput: function (component, event, helper) {
        component.set("v.SelectedValue", component.get("v.InputString")); // copy input to output
    }
})