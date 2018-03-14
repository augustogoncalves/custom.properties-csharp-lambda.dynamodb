/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

// *******************************************
// Object Code properties panel
// *******************************************
function ObjectCodePanel(viewer, container, id, title, options) {
    this.viewer = viewer;
    Autodesk.Viewing.UI.PropertyPanel.call(this, container, id, title, options);
}
ObjectCodePanel.prototype = Object.create(Autodesk.Viewing.UI.PropertyPanel.prototype);
ObjectCodePanel.prototype.constructor = ObjectCodePanel;

// *******************************************
// Object Code extension
// *******************************************
function ObjectCodeExtension(viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options);
    this.viewer = viewer;
    this.options = options;
    this.toolbarButtonShowDockingPanel = null;
    this.panel = null;
}

ObjectCodeExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
ObjectCodeExtension.prototype.constructor = ObjectCodeExtension;

ObjectCodeExtension.prototype.load = function () {
    if (this.options == null || this.options.objectCodeProperty == null || this.options.objectCodeProperty === '') {
        console.log('ERROR: objectCodeProperty options not specified, ObjectCodeExtension extension cannot load.');
        return false;
    }

    var _this = this;
    this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, function (e) {
        if (e.dbIdArray.length == 0) {
            _this.subToolbar.setVisible(false);
            if (_this.panel) _this.panel.setVisible(false);
            return;
        }
        _this.viewer.model.getBulkProperties(e.dbIdArray, [_this.options.objectCodeProperty, 'name'], function (elements) {
            _this.subToolbar.setVisible((elements.length > 0));
            if (_this.panel) _this.panel.removeAllProperties();
            if (_this.panel && elements.length > 0) _this.loadObjectCode(elements);
        })
    })


    if (this.viewer.toolbar) {
        // Toolbar is already available, create the UI
        this.createUI();
    } else {
        // Toolbar hasn't been created yet, wait until we get notification of its creation
        this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
        this.viewer.addEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
    }
    return true;
};

ObjectCodeExtension.prototype.loadObjectCode = function (elements) {
    var _this = this;
    _this.panel.removeAllProperties();
    elements.forEach(function (element) {
        fetch('https://9tevqm5cke.execute-api.us-west-2.amazonaws.com/Prod/api/objectcode/' + element.properties[0].displayValue)
            .then((resp) => resp.json())
            .then(function (data) {
                _this.panel.addProperty('Code', data.codeId, element.name);
                _this.panel.addProperty('Name', data.name, element.name);
                _this.panel.addProperty('Type', data.type, element.name);
                _this.panel.addProperty('Description', data.description, element.name);
            })
            .catch(function (error) {
                console.log(error);
            });
    })

}

ObjectCodeExtension.prototype.onToolbarCreated = function () {
    this.viewer.removeEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
    this.onToolbarCreatedBinded = null;
    this.createUI();
};

ObjectCodeExtension.prototype.createUI = function () {
    var _this = this;

    // need to create the panel for later use
    if (_this.panel == null) {
        _this.panel = new ObjectCodePanel(_this.viewer, _this.viewer.container,
            'objectCodePanel', 'Object Code');
    }

    // button to show the docking panel
    var toolbarButtonShowDockingPanel = new Autodesk.Viewing.UI.Button('showObjectCodePanel');
    toolbarButtonShowDockingPanel.onClick = function (e) {
        // show/hide docking panel
        _this.panel.setVisible(!_this.panel.isVisible());
    };

    toolbarButtonShowDockingPanel.addClass('ObjectCodeToolbarButton');
    toolbarButtonShowDockingPanel.setToolTip('Object Code');

    // SubToolbar
    this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('ObjectCodeToolbar');
    this.subToolbar.addControl(toolbarButtonShowDockingPanel);

    this.viewer.toolbar.addControl(this.subToolbar);
    this.subToolbar.setVisible(false);
};

ObjectCodeExtension.prototype.unload = function () {
    this.viewer.toolbar.removeControl(this.subToolbar);
    return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('ObjectCodeExtension', ObjectCodeExtension);