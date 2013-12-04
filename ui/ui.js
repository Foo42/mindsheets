define(['lib/knockout/knockout-2.2.0', 'lib/microevent/microevent', 'core/core', 'lib/knockout/custom-bindings'], function(ko, MicroEvent, core){    
    var SingleValueViewModel = (function(){
    	var constructor = function(sheetEntity, hostingSheet){
    		var self = this;
    		var valueObject = sheetEntity.valueSource;
    		
    		//public properties
    		self.position      = ko.observable(sheetEntity.position);
    		self.value         = ko.observable(valueObject.Value());
    		self.definition    = ko.observable(valueObject.Definition());
    		self.requestedName = ko.observable();
            self.name          = ko.observable();
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
    			valueObject.Definition(newDefinitionValue);
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
    			if(vmForClickTarget.sheet != self)
    				return; //We are only interested in clicks directly on sheet, not events bubbling up
    
    			var pos = {x:event.pageX + "px", y:event.pageY + "px"};
    			self.addItemAtPosition(pos);
    		}
    
    
    		//private methods
    		var onActiveItemChanged = function(newActiveItem){		
    			var itemsToDeactivate = self.items().filter(function(item){
    				return item !== newActiveItem
    			});        
    			
    			itemsToDeactivate.forEach(function(item){
    				item.isEditing(false);
    			});

    		};
    	};

        return constructor;
    })();
    
    
    RootViewModel = (function(){
    	return function(){
    		var self = this;
    
    		self.sheet = new SheetVM(new core.Sheet());
    	};
    })();
    
    var module = {
        SingleValueViewModel:SingleValueViewModel,
        SheetVM:SheetVM,
        RootViewModel:RootViewModel
    };
    
    return module;
});



