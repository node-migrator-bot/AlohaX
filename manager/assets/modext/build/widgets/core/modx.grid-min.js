Ext.namespace("MODx.grid");MODx.grid.Grid=function(A){A=A||{};this.config=A;this._loadStore();this._loadColumnModel();Ext.applyIf(A,{store:this.store,cm:this.cm,sm:new Ext.grid.RowSelectionModel({singleSelect:true}),paging:(A.bbar?true:false),loadMask:true,autoHeight:true,collapsible:true,stripeRows:true,header:false,cls:"modx-grid",preventRender:true,preventSaveRefresh:true,showPerPage:true,stateful:false,menuConfig:{defaultAlign:"tl-b?",enableScrolling:false},viewConfig:{forceFit:true,enableRowBody:true,autoFill:true,showPreview:true,scrollOffset:0,emptyText:A.emptyText||_("ext_emptymsg")}});if(A.paging){var C=A.showPerPage?["-",_("per_page")+":",{xtype:"textfield",value:A.pageSize||(parseInt(MODx.config.default_per_page)||20),width:40,listeners:{change:{fn:function(G,E,F){E=parseInt(E);this.getBottomToolbar().pageSize=E;this.store.load({params:{start:0,limit:E}});},scope:this}}}]:[];if(A.pagingItems){for(var B=0;B<A.pagingItems.length;B++){C.push(A.pagingItems[B]);}}Ext.applyIf(A,{bbar:new Ext.PagingToolbar({pageSize:A.pageSize||(parseInt(MODx.config.default_per_page)||20),store:this.getStore(),displayInfo:true,items:C})});}if(A.grouping){Ext.applyIf(A,{view:new Ext.grid.GroupingView({forceFit:true,scrollOffset:0,groupTextTpl:'{text} ({[values.rs.length]} {[values.rs.length > 1 ? "'+(A.pluralText||_("records"))+'" : "'+(A.singleText||_("record"))+'"]})'})});}if(A.tbar){for(var B=0;B<A.tbar.length;B++){var D=A.tbar[B];if(D.handler&&typeof (D.handler)=="object"&&D.handler.xtype){D.handler=this.loadWindow.createDelegate(this,[D.handler],true);}if(!D.scope){D.scope=this;}}}MODx.grid.Grid.superclass.constructor.call(this,A);this._loadMenu(A);this.addEvents("beforeRemoveRow","afterRemoveRow","afterAutoSave");if(!A.preventRender){this.render();}this.on("rowcontextmenu",this._showMenu,this);if(A.autosave){this.on("afteredit",this.saveRecord,this);}if(A.paging&&A.grouping){this.getBottomToolbar().bind(this.store);}this.getStore().load({params:{start:A.pageStart||0,limit:A.pageSize||(parseInt(MODx.config.default_per_page)||20)},scope:this,callback:function(){this.getStore().reload();}});this.getStore().on("exception",this.onStoreException,this);this.config=A;};Ext.extend(MODx.grid.Grid,Ext.grid.EditorGridPanel,{windows:{},onStoreException:function(F,C,A,B,E){var D=Ext.decode(E.responseText);if(D.message){this.getView().emptyText=D.message;this.getView().refresh(false);}},saveRecord:function(C){C.record.data.menu=null;var B=this.config.saveParams||{};Ext.apply(C.record.data,B);var D=Ext.util.JSON.encode(C.record.data);var A=this.config.saveUrl||(this.config.url||this.config.connector);MODx.Ajax.request({url:A,params:{action:this.config.save_action||"updateFromGrid",data:D},listeners:{success:{fn:function(E){if(this.config.save_callback){Ext.callback(this.config.save_callback,this.config.scope||this,[E]);}C.record.commit();if(!this.config.preventSaveRefresh){this.refresh();}this.fireEvent("afterAutoSave",E);},scope:this}}});return true;},loadWindow:function(A,E,D,C){var B=this.menu.record;if(!this.windows[D.xtype]||D.force){Ext.applyIf(D,{record:D.blankValues?{}:B,grid:this,listeners:{success:{fn:D.success||this.refresh,scope:D.scope||this}}});if(C){Ext.apply(D,C);}this.windows[D.xtype]=Ext.ComponentMgr.create(D);}if(this.windows[D.xtype].setValues&&D.blankValues!==true&&B!=undefined){this.windows[D.xtype].setValues(B);}this.windows[D.xtype].show(E.target);},confirm:function(B,D){var C={action:B};var A=this.config.primaryKey||"id";C[A]=this.menu.record[A];MODx.msg.confirm({title:_(B),text:_(D)||_("confirm_remove"),url:this.config.url,params:C,listeners:{success:{fn:this.refresh,scope:this}}});},remove:function(D){var B=this.menu.record;D=D||"confirm_remove";var C=this.config.saveParams||{};Ext.apply(C,{action:"remove"});var A=this.config.primaryKey||"id";C[A]=B[A];if(this.fireEvent("beforeRemoveRow",B)){MODx.msg.confirm({title:_("warning"),text:_(D),url:this.config.url,params:C,listeners:{success:{fn:function(){this.removeActiveRow(B);},scope:this}}});}},removeActiveRow:function(A){if(this.fireEvent("afterRemoveRow",A)){var B=this.getSelectionModel().getSelected();this.getStore().remove(B);}},_loadMenu:function(){this.menu=new Ext.menu.Menu(this.config.menuConfig);},_showMenu:function(C,B,D){D.stopEvent();D.preventDefault();this.menu.record=this.getStore().getAt(B).data;if(!this.getSelectionModel().isSelected(B)){this.getSelectionModel().selectRow(B);}this.menu.removeAll();if(this.getMenu){var A=this.getMenu(C,B,D);if(A&&A.length&&A.length>0){this.addContextMenuItem(A);}}if((!A||A.length<=0)&&this.menu.record.menu){this.addContextMenuItem(this.menu.record.menu);}if(this.menu.items.length>0){this.menu.showAt(D.xy);}},_loadStore:function(){if(this.config.grouping){this.store=new Ext.data.GroupingStore({url:this.config.url,baseParams:this.config.baseParams||{action:this.config.action||"getList"},reader:new Ext.data.JsonReader({totalProperty:"total",root:"results",fields:this.config.fields}),sortInfo:{field:this.config.sortBy||"id",direction:this.config.sortDir||"ASC"},remoteSort:this.config.remoteSort!=false?true:false,groupField:this.config.groupBy||"name",storeId:this.config.storeId||Ext.id(),autoDestroy:true});}else{this.store=new Ext.data.JsonStore({url:this.config.url,baseParams:this.config.baseParams||{action:this.config.action||"getList"},fields:this.config.fields,root:"results",totalProperty:"total",remoteSort:this.config.remoteSort||false,storeId:this.config.storeId||Ext.id(),autoDestroy:true});}},_loadColumnModel:function(){if(this.config.columns){var c=this.config.columns;for(var i=0;i<c.length;i++){if(typeof (c[i].editor)=="string"){c[i].editor=eval(c[i].editor);}if(typeof (c[i].renderer)=="string"){c[i].renderer=eval(c[i].renderer);}if(typeof (c[i].editor)=="object"&&c[i].editor.xtype){var r=c[i].editor.renderer;c[i].editor=Ext.ComponentMgr.create(c[i].editor);if(r===true){c[i].renderer=MODx.combo.Renderer(c[i].editor);}else{if(c[i].editor.initialConfig.xtype==="datefield"){c[i].renderer=Ext.util.Format.dateRenderer(c[i].editor.initialConfig.format||"Y-m-d");}else{if(r==="boolean"){c[i].renderer=this.rendYesNo;}else{if(r==="password"){c[i].renderer=this.rendPassword;}else{if(r==="local"&&typeof (c[i].renderer)=="string"){c[i].renderer=eval(c[i].renderer);}}}}}}}this.cm=new Ext.grid.ColumnModel(c);}},addContextMenuItem:function(items){var a=items,l=a.length;for(var i=0;i<l;i++){var options=a[i];if(options=="-"){this.menu.add("-");continue;}var h=Ext.emptyFn;if(options.handler){h=eval(options.handler);if(h&&typeof (h)=="object"&&h.xtype){h=this.loadWindow.createDelegate(this,[h],true);}}else{h=function(itm,e){var o=itm.options;var id=this.menu.record.id;if(o.confirm){Ext.Msg.confirm("",o.confirm,function(e){if(e=="yes"){var a=Ext.urlEncode(o.params||{action:o.action});var s="index.php?id="+id+"&"+a;location.href=s;}},this);}else{var a=Ext.urlEncode(o.params||{action:o.action});var s="index.php?id="+id+"&"+a;location.href=s;}};}this.menu.add({id:options.id||Ext.id(),text:options.text,scope:options.scope||this,options:options,handler:h});}},refresh:function(){this.getStore().reload();},rendPassword:function(A,B){var C="";for(i=0;i<A.length;i++){C=C+"*";}return C;},rendYesNo:function(A,B){if(A===1||A=="1"){A=true;}if(A===0||A=="0"){A=false;}switch(A){case true:case"true":case 1:B.css="green";return _("yes");case false:case"false":case"":case 0:B.css="red";return _("no");}},getSelectedAsList:function(){var A=this.getSelectionModel().getSelections();if(A.length<=0){return false;}var C="";for(var B=0;B<A.length;B++){C+=","+A[B].data.id;}if(C[0]==","){C=C.substr(1);}return C;},editorYesNo:function(A){A=A||{};Ext.applyIf(A,{store:new Ext.data.SimpleStore({fields:["d","v"],data:[[_("yes"),true],[_("no"),false]]}),displayField:"d",valueField:"v",mode:"local",triggerAction:"all",editable:false,selectOnFocus:false});return new Ext.form.ComboBox(A);},encodeModified:function(){var C=this.getStore().getModifiedRecords();var A={};for(var B=0;B<C.length;B++){A[C[B].data[this.config.primaryKey||"id"]]=C[B].data;}return Ext.encode(A);},encode:function(){var C=this.getStore().getRange();var A={};for(var B=0;B<C.length;B++){A[C[B].data[this.config.primaryKey||"id"]]=C[B].data;}return Ext.encode(A);},expandAll:function(){if(!this.exp){return false;}this.exp.expandAll();this.tools.plus.hide();this.tools.minus.show();return true;},collapseAll:function(){if(!this.exp){return false;}this.exp.collapseAll();this.tools.minus.hide();this.tools.plus.show();return true;}});MODx.grid.LocalGrid=function(A){A=A||{};if(A.grouping){Ext.applyIf(A,{view:new Ext.grid.GroupingView({forceFit:true,scrollOffset:0,hideGroupedColumn:A.hideGroupedColumn?true:false,groupTextTpl:A.groupTextTpl||('{text} ({[values.rs.length]} {[values.rs.length > 1 ? "'+(A.pluralText||_("records"))+'" : "'+(A.singleText||_("record"))+'"]})')})});}if(A.tbar){for(var B=0;B<A.tbar.length;B++){var C=A.tbar[B];if(C.handler&&typeof (C.handler)=="object"&&C.handler.xtype){C.handler=this.loadWindow.createDelegate(this,[C.handler],true);}if(!C.scope){C.scope=this;}}}Ext.applyIf(A,{title:"",store:this._loadStore(A),sm:new Ext.grid.RowSelectionModel({singleSelect:false}),loadMask:true,collapsible:true,stripeRows:true,enableColumnMove:true,header:false,cls:"modx-grid",viewConfig:{forceFit:true,enableRowBody:true,autoFill:true,showPreview:true,scrollOffset:0,emptyText:A.emptyText||_("ext_emptymsg")},menuConfig:{defaultAlign:"tl-b?",enableScrolling:false}});this.menu=new Ext.menu.Menu(A.menuConfig);this.config=A;this._loadColumnModel();MODx.grid.LocalGrid.superclass.constructor.call(this,A);this.addEvents({beforeRemoveRow:true,afterRemoveRow:true});this.on("rowcontextmenu",this._showMenu,this);};Ext.extend(MODx.grid.LocalGrid,Ext.grid.EditorGridPanel,{windows:{},_loadStore:function(A){if(A.grouping){this.store=new Ext.data.GroupingStore({data:A.data||[],reader:new Ext.data.ArrayReader({},A.fields||[]),sortInfo:A.sortInfo||{field:A.sortBy||"name",direction:A.sortDir||"ASC"},groupField:A.groupBy||"name"});}else{this.store=new Ext.data.SimpleStore({fields:A.fields,data:A.data||[]});}return this.store;},loadWindow:function(A,E,D,C){var B=this.menu.record;if(!this.windows[D.xtype]){Ext.applyIf(D,{scope:this,success:this.refresh,record:D.blankValues?{}:B});if(C){Ext.apply(D,C);}this.windows[D.xtype]=Ext.ComponentMgr.create(D);}if(this.windows[D.xtype].setValues&&D.blankValues!==true&&B!=undefined){this.windows[D.xtype].setValues(B);}this.windows[D.xtype].show(E.target);},_loadColumnModel:function(){if(this.config.columns){var c=this.config.columns;for(var i=0;i<c.length;i++){if(typeof (c[i].editor)=="string"){c[i].editor=eval(c[i].editor);}if(typeof (c[i].renderer)=="string"){c[i].renderer=eval(c[i].renderer);}if(typeof (c[i].editor)=="object"&&c[i].editor.xtype){var r=c[i].editor.renderer;c[i].editor=Ext.ComponentMgr.create(c[i].editor);if(r===true){c[i].renderer=MODx.combo.Renderer(c[i].editor);}else{if(c[i].editor.initialConfig.xtype==="datefield"){c[i].renderer=Ext.util.Format.dateRenderer(c[i].editor.initialConfig.format||"Y-m-d");}else{if(r==="boolean"){c[i].renderer=this.rendYesNo;}else{if(r==="local"&&typeof (c[i].renderer)=="string"){c[i].renderer=eval(c[i].renderer);}}}}}}this.cm=new Ext.grid.ColumnModel(c);}},_showMenu:function(C,B,D){D.stopEvent();D.preventDefault();this.menu.recordIndex=B;this.menu.record=this.getStore().getAt(B).data;if(!this.getSelectionModel().isSelected(B)){this.getSelectionModel().selectRow(B);}this.menu.removeAll();var A=this.getMenu(C,B);if(A){this.addContextMenuItem(A);this.menu.showAt(D.xy);}},getMenu:function(){return this.menu.record.menu;},addContextMenuItem:function(items){var a=items,l=a.length;for(var i=0;i<l;i++){var options=a[i];if(options=="-"){this.menu.add("-");continue;}var h=Ext.emptyFn;if(options.handler){h=eval(options.handler);if(h&&typeof (h)=="object"&&h.xtype){h=this.loadWindow.createDelegate(this,[h],true);}}else{h=function(itm,e){var o=itm.options;var id=this.menu.record.id;var w=Ext.get("modx_content");if(o.confirm){Ext.Msg.confirm("",o.confirm,function(e){if(e=="yes"){var a=Ext.urlEncode(o.params||{action:o.action});var s="index.php?id="+id+"&"+a;if(w===null){location.href=s;}else{w.dom.src=s;}}},this);}else{var a=Ext.urlEncode(o.params||{action:o.action});var s="index.php?id="+id+"&"+a;if(w===null){location.href=s;}else{w.dom.src=s;}}};}this.menu.add({id:options.id||Ext.id(),text:options.text,scope:this,options:options,handler:h});}},remove:function(A){var B=this.getSelectionModel().getSelected();if(this.fireEvent("beforeRemoveRow",B)){Ext.Msg.confirm(A.title||"",A.text||"",function(C){if(C=="yes"){this.getStore().remove(B);this.fireEvent("afterRemoveRow",B);}},this);}},encode:function(){var D=this.getStore();var C=D.getCount();var A=this.config.encodeByPk?{}:[];var E;for(var B=0;B<C;B++){E=D.getAt(B).data;E.menu=null;if(this.config.encodeAssoc){A[E[this.config.encodeByPk||"id"]]=E;}else{A.push(E);}}return Ext.encode(A);},expandAll:function(){if(!this.exp){return false;}this.exp.expandAll();this.tools.plus.hide();this.tools.minus.show();return true;},collapseAll:function(){if(!this.exp){return false;}this.exp.collapseAll();this.tools.minus.hide();this.tools.plus.show();return true;},rendYesNo:function(A,B){switch(A){case"":return"-";case false:B.css="red";return _("no");case true:B.css="green";return _("yes");}}});Ext.reg("grid-local",MODx.grid.LocalGrid);Ext.reg("modx-grid-local",MODx.grid.LocalGrid);Ext.ns("Ext.ux.grid");Ext.ux.grid.RowExpander=Ext.extend(Ext.util.Observable,{expandOnEnter:true,expandOnDblClick:true,header:"",width:20,sortable:false,fixed:true,menuDisabled:true,dataIndex:"",id:"expander",lazyRender:true,enableCaching:false,constructor:function(A){Ext.apply(this,A);this.addEvents({beforeexpand:true,expand:true,beforecollapse:true,collapse:true});Ext.ux.grid.RowExpander.superclass.constructor.call(this);if(this.tpl){if(typeof this.tpl=="string"){this.tpl=new Ext.Template(this.tpl);}this.tpl.compile();}this.state={};this.bodyContent={};},getRowClass:function(B,A,C,E){C.cols=C.cols-1;var D=this.bodyContent[B.id];if(!D&&!this.lazyRender){D=this.getBodyContent(B,A);}if(D){C.body=D;}return this.state[B.id]?"x-grid3-row-expanded":"x-grid3-row-collapsed";},init:function(B){this.grid=B;var A=B.getView();A.getRowClass=this.getRowClass.createDelegate(this);A.enableRowBody=true;B.on("render",this.onRender,this);B.on("destroy",this.onDestroy,this);},onRender:function(){var B=this.grid;var A=B.getView().mainBody;A.on("mousedown",this.onMouseDown,this,{delegate:".x-grid3-row-expander"});if(this.expandOnEnter){this.keyNav=new Ext.KeyNav(this.grid.getGridEl(),{enter:this.onEnter,scope:this});}if(this.expandOnDblClick){B.on("rowdblclick",this.onRowDblClick,this);}},onDestroy:function(){this.keyNav.disable();delete this.keyNav;var A=this.grid.getView().mainBody;A.un("mousedown",this.onMouseDown,this);},onRowDblClick:function(B,A,C){this.toggleRow(A);},onEnter:function(F){var E=this.grid;var C=E.getSelectionModel();var B=C.getSelections();for(var D=0,A=B.length;D<A;D++){var G=E.getStore().indexOf(B[D]);this.toggleRow(G);}},getBodyContent:function(B,A){if(!this.enableCaching){return this.tpl.apply(B.data);}var C=this.bodyContent[B.id];if(!C){C=this.tpl.apply(B.data);this.bodyContent[B.id]=C;}return C;},onMouseDown:function(C,B){C.stopEvent();var A=C.getTarget(".x-grid3-row");this.toggleRow(A);},renderer:function(B,C,A){C.cellAttr='rowspan="2"';if(A.data.description!==null&&A.data.description===""){return"";}return'<div class="x-grid3-row-expander">&#160;</div>';},beforeExpand:function(B,A,C){if(this.fireEvent("beforeexpand",this,B,A,C)!==false){if(this.tpl&&this.lazyRender){A.innerHTML=this.getBodyContent(B,C);}return true;}else{return false;}},toggleRow:function(A){if(typeof A=="number"){A=this.grid.view.getRow(A);}this[Ext.fly(A).hasClass("x-grid3-row-collapsed")?"expandRow":"collapseRow"](A);},expandRow:function(B){if(typeof B=="number"){B=this.grid.view.getRow(B);}var A=this.grid.store.getAt(B.rowIndex);var C=Ext.DomQuery.selectNode("tr:nth(2) div.x-grid3-row-body",B);if(this.beforeExpand(A,C,B.rowIndex)){this.state[A.id]=true;Ext.fly(B).replaceClass("x-grid3-row-collapsed","x-grid3-row-expanded");this.fireEvent("expand",this,A,C,B.rowIndex);}},collapseRow:function(B){if(typeof B=="number"){B=this.grid.view.getRow(B);}var A=this.grid.store.getAt(B.rowIndex);var C=Ext.fly(B).child("tr:nth(1) div.x-grid3-row-body",true);if(this.fireEvent("beforecollapse",this,A,C,B.rowIndex)!==false){this.state[A.id]=false;Ext.fly(B).replaceClass("x-grid3-row-expanded","x-grid3-row-collapsed");this.fireEvent("collapse",this,A,C,B.rowIndex);}},expandAll:function(){var A=this.grid.getView().getRows();for(var B=0;B<A.length;B++){this.expandRow(A[B]);}},collapseAll:function(){var A=this.grid.getView().getRows();for(var B=0;B<A.length;B++){this.collapseRow(A[B]);}}});Ext.preg("rowexpander",Ext.ux.grid.RowExpander);Ext.grid.RowExpander=Ext.ux.grid.RowExpander;Ext.ns("Ext.ux.grid");Ext.ux.grid.CheckColumn=function(A){Ext.apply(this,A);if(!this.id){this.id=Ext.id();}this.renderer=this.renderer.createDelegate(this);};Ext.ux.grid.CheckColumn.prototype={init:function(A){this.grid=A;this.grid.on("render",function(){var B=this.grid.getView();B.mainBody.on("mousedown",this.onMouseDown,this);},this);},onMouseDown:function(D,C){this.grid.fireEvent("rowclick");if(C.className&&C.className.indexOf("x-grid3-cc-"+this.id)!=-1){D.stopEvent();var B=this.grid.getView().findRowIndex(C);var A=this.grid.store.getAt(B);A.set(this.dataIndex,!A.data[this.dataIndex]);this.grid.fireEvent("afteredit");}},renderer:function(B,C,A){C.css+=" x-grid3-check-col-td";return'<div class="x-grid3-check-col'+(B?"-on":"")+" x-grid3-cc-"+this.id+'">&#160;</div>';}};Ext.preg("checkcolumn",Ext.ux.grid.CheckColumn);Ext.grid.CheckColumn=Ext.ux.grid.CheckColumn;Ext.grid.PropertyColumnModel=function(B,A){var C=Ext.grid,D=Ext.form;this.grid=B;C.PropertyColumnModel.superclass.constructor.call(this,[{header:this.nameText,width:50,sortable:true,dataIndex:"name",id:"name",menuDisabled:true},{header:this.valueText,width:50,resizable:false,dataIndex:"value",id:"value",menuDisabled:true}]);this.store=A;var E=new D.Field({autoCreate:{tag:"select",children:[{tag:"option",value:"true",html:"true"},{tag:"option",value:"false",html:"false"}]},getValue:function(){return this.el.dom.value=="true";}});this.editors={date:new C.GridEditor(new D.DateField({selectOnFocus:true})),string:new C.GridEditor(new D.TextField({selectOnFocus:true})),number:new C.GridEditor(new D.NumberField({selectOnFocus:true,style:"text-align:left;"})),"boolean":new C.GridEditor(E)};this.renderCellDelegate=this.renderCell.createDelegate(this);this.renderPropDelegate=this.renderProp.createDelegate(this);};Ext.extend(Ext.grid.PropertyColumnModel,Ext.grid.ColumnModel,{nameText:"Name",valueText:"Value",dateFormat:"m/j/Y",renderDate:function(A){return A.dateFormat(this.dateFormat);},renderBool:function(A){return A?"true":"false";},isCellEditable:function(B,A){return B==1;},getRenderer:function(A){return A==1?this.renderCellDelegate:this.renderPropDelegate;},renderProp:function(A){return this.getPropertyName(A);},renderCell:function(B){var A=B;if(Ext.isDate(B)){A=this.renderDate(B);}else{if(typeof B=="boolean"){A=this.renderBool(B);}}return Ext.util.Format.htmlEncode(A);},getPropertyName:function(B){var A=this.grid.propertyNames;return A&&A[B]?A[B]:B;},getCellEditor:function(B,A){var C=this.store.getProperty(A),E=C.data.name,D=C.data.value;if(this.grid.customEditors[E]){return this.grid.customEditors[E];}if(Ext.isDate(D)){return this.editors.date;}else{if(typeof D=="number"){return this.editors.number;}else{if(typeof D=="boolean"){return this.editors["boolean"];}else{return this.editors.string;}}}},destroy:function(){Ext.grid.PropertyColumnModel.superclass.destroy.call(this);for(var A in this.editors){Ext.destroy(A);}}});