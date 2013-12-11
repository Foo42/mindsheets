define(['core/core', 'ui/ui'],function(core, ui){
    
    var getSheetForTests = function(){
        return new core.Sheet();
    }
    
    
    module("SingleValueViewModel Tests");
    test("SingleValueViewModel updates its value when its SingleValueSource changes its value", function() {
        //Arrange
        var svs = new core.SingleValueSource();
    	svs.Value(1);
    	var vm = new ui.SingleValueViewModel({valueSource:svs}, getSheetForTests());
    	var viewModelRaisedEvent = false;
    	vm.value.subscribe(function(){viewModelRaisedEvent = true});
    
    
    	//Act
    	svs.Value(2);
    
    	//Assert
    	ok(viewModelRaisedEvent);
    	equal(vm.value(), 2);
    })
    
    test("Changing the definition on a SingleValueViewModel updates the definition on its SingleValueSource", function() {
    	//Arrange
    	var svs = new core.SingleValueSource();
    	svs.Definition("0");
    	var vm = new ui.SingleValueViewModel({valueSource:svs}, getSheetForTests());
    
    	//Act
    	vm.definition("1");
    
    	//Assert
    	equal(svs.Definition(), "1");
    })
    
    test("Setting requestedName on a SingleValueViewModel causes it to call trySetName on the sheet it was constructed with, ",function(){
    	//Arrange
    	var itemToAdd = new core.SheetElement(new core.SingleValueSource(), {x:0,y:0});
    	
    	var functionWasCalled = false;
    	var itemPassedInFunction;
    	var nameRequestedInFunction;
    	var sheet = {
            trySetName:function(item, requestedName){
    		    functionWasCalled=true;
    		    itemPassedInFunction = item;
    		    nameRequestedInFunction = requestedName;
    	    },
            bind:function(){}
        };
    
    	var vm = new ui.SingleValueViewModel(itemToAdd, sheet);
    
    	//Act
    	vm.requestedName("Foo");
    
    	//Assert
    	ok(functionWasCalled);
    	strictEqual(itemPassedInFunction, itemToAdd);
    	strictEqual(nameRequestedInFunction, "Foo");
    });
    
    test("SingleValueViewModel name property takes its value from name assigment on sheet", function(){
    	//Arrange
    	var sheetModel = new core.Sheet();
    	var sheetVM = new ui.SheetVM(sheetModel);
    
    	var item = new core.SheetElement(new core.SingleValueSource(), {x:0,y:0})
    	sheetModel.addItem(item);
    
    	var itemVM = sheetVM.items()[0];
    	equal(itemVM.name(), undefined);
    
    	//Act
    	var chosenName = "foo";
    	sheetModel.trySetName(item, chosenName);
    
    	//Assert	
    	equal(itemVM.name(), chosenName);
    });
    
    module("SheetViewModel Tests");
    test("When the Sheet model adds an item, the SheetViewModel adds a corresponding ItemViewModel", function(){
    	//Arrange
    	var sheetModel = new core.Sheet();
    	var sheetVM = new ui.SheetVM(sheetModel);
    	var vmRaisedEvent = false;
    	sheetVM.items.subscribe(function(){vmRaisedEvent = true});
    	equal(sheetVM.items().length, 0);
    
    	var itemToAdd = new core.SingleValueSource();
    
    	//Act
    	sheetModel.addItem({valueSource:itemToAdd});
    
    	//Assert
    	ok(vmRaisedEvent);
    	equal(sheetVM.items().length, 1);
    });

    test("When the Sheet model removes an item, the SheetViewModel removes the corresponding ItemViewModel", function(){
        //Arrange
        var sheetModel = new core.Sheet();
        var sheetVM = new ui.SheetVM(sheetModel);
        var itemA = new core.SheetElement(new core.SingleValueSource(), {x:0,y:0});
        sheetModel.addItem(itemA);
        equal(sheetVM.items().length, 1);

        sheetVM.items.subscribe(function(){vmRaisedEvent = true});
        
        //Act
        sheetModel.removeItem(itemA);    
    
        //Assert
        equal(sheetVM.items().length, 0);
    });
    
    test("When sheet model assigns a name, view model for that item changes its name", function(){
    	//Arrange
    	var sheet = new core.Sheet();
    	var item = new core.SheetElement(new core.SingleValueSource(), {x:0,y:0});
    	
    	var sheetVM = new ui.SheetVM(sheet);
        
    	sheet.addItem(item);
        var itemVM = sheetVM.items()[0];
    
    	//Act
    	sheet.trySetName(item, "Foo");
    
    
    	//Assert
    	equal(itemVM.name(), "Foo");
    });    

    test("When an item view model with no definition or name is deactivated, it is removed", function(){
        //Arrange
        var sheetModel = new core.Sheet();
        var sheetVM = new ui.SheetVM(sheetModel);
        
        var itemA = new core.SingleValueSource();
        var itemB = new core.SingleValueSource(); 
        sheetModel.addItem({valueSource:itemA});
        sheetVM.items()[0].requestedName("foo");
        sheetModel.addItem({valueSource:itemB});

        //Act & Assert
        equal(sheetVM.items().length,2);
        sheetVM.items()[0].startEditing();
        equal(sheetVM.items().length,1);
    });
});



