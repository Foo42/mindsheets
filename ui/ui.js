define(['lib/knockout/knockout-2.2.0', 'lib/microevent/microevent', 'core/core', 'lib/knockout/custom-bindings'], function(ko, MicroEvent, core){    
    var SingleValueViewModel = (function(){
    	var constructor = function(sheetEntity, hostingSheet){
    		var self = this;
    		var valueObject = sheetEntity.valueSource;

            var existingNameOnSheet = hostingSheet.tryGetName(sheetEntity);
    		
    		//public properties
    		self.position      = ko.observable(sheetEntity.position);
    		self.value         = ko.observable(valueObject.value);
    		self.definition    = ko.observable(valueObject.definition);
    		self.requestedName = ko.observable(existingNameOnSheet);
            self.name          = ko.observable(existingNameOnSheet);
    		self.isEditing     = ko.observable(true);
            self.model         = sheetEntity;
    
    
    		//Subscribe to model events
    		valueObject.bind('valueChanged', function(newValue){
    			self.value(newValue);
    		});
            
            hostingSheet.bind('nameAssigned', function(nameRecord){
                if(nameRecord.item == sheetEntity)
                {
                    self.name(nameRecord.name);
                }
                
    		});
    
    		
    		// Update the model when our observables change
    		self.definition.subscribe(function(newDefinitionValue){
    			valueObject.definition = newDefinitionValue;
    		});
    
    		self.requestedName.subscribe(function(name){
    			hostingSheet.trySetName(sheetEntity, name);
    		});
    
    		
    		//public methods
    		self.startEditing = function(data, event){
    			self.isEditing(true);
    			self.trigger('startedEditing',self);
    		};

            self.stopEditing = function(data, event){
                self.isEditing(false);
                self.trigger('stoppedEditing',self);
            };
    
    	};
    
    	MicroEvent.mixin(constructor);
    	return constructor;
    })();
    
    
    SheetVM = (function(){

        var constructor = function(sheetModel){
    		var self = this;
    		var sheet = sheetModel;    		
    
    		//public properties
    		self.items = ko.observableArray();                

            var onSheetItemAdded = function(newItem){
                var itemVM = new SingleValueViewModel(newItem, sheet);

                itemVM.bind('startedEditing', onActiveItemChanged);
                itemVM.requestedName.subscribe(function(newName){
                    sheet.trySetName(newItem, newName)
                });

                self.items.push(itemVM);
                onActiveItemChanged(itemVM);
            };

            var onSheetItemRemoved = function(removedItem){
                self.items.remove(function(vm){return vm.model === removedItem});
            };
    
    		//subscribe to model events
    		sheet.bind('itemAdded', onSheetItemAdded);
            sheet.bind('itemRemoved', onSheetItemRemoved);
    
    		
    		//public methods
    		self.addItemAtPosition = function(position){
    			sheet.createItemAt(position);
    		};
    
    		self.clicked = function(data, event){
    			var vmForClickTarget = ko.dataFor(event.target);
    			if(vmForClickTarget.sheet() != self)
    				return; //We are only interested in clicks directly on sheet, not events bubbling up
    
    			var pos = {x:event.offsetX + "px", y:event.offsetY + "px"};
    			self.addItemAtPosition(pos);
    		}

            self.save = function(){
                return JSON.stringify(sheet.extractMemento());
            }
    
    
    		//private methods
    		var onActiveItemChanged = function(newActiveItem){		
    			var itemsToDeactivate = self.items().filter(function(item){
    				return item !== newActiveItem
    			});        
    			
    			itemsToDeactivate.forEach(function(item){
    				item.isEditing(false);
    			});

                itemsToDeactivate.filter(function(item){return !item.definition() && !item.requestedName()}).forEach(function(item){sheet.removeItem(item.model);});
    		};

            var initialiseFromCurrentStateOfSheetModel = function(sheetModel){
                sheetModel.forEachItem(function(itemModel){
                    onSheetItemAdded(itemModel);
                });
            }
            initialiseFromCurrentStateOfSheetModel(sheetModel);
    	};

        return constructor;
    })();
    
    
    RootViewModel = (function(){
    	return function(persistedSheetData){
    		var self = this;
    
    		self.sheet = ko.observable(new SheetVM(new core.Sheet(persistedSheetData)));
            self.save = function(){
                alert(self.sheet().save());
            }
            

            self.loadingJSON = ko.observable();
            
            self.loadButtonEnabled = ko.computed(function(){
                return self.loadingJSON() && self.loadingJSON().length;
            },self);

            self.load = function(){
                var memento = JSON.parse(self.loadingJSON());
                self.sheet(new SheetVM(new core.Sheet(memento)));
                self.loadingJSON("");
            }
    	};
    })();
    
    var module = {
        SingleValueViewModel:SingleValueViewModel,
        SheetVM:SheetVM,
        RootViewModel:RootViewModel
    };
    
    return module;
});



