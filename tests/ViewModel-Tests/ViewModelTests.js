module("SingleValueViewModel Tests");
test("SingleValueViewModel updates its value when its SingleValueSource changes its value", function() {
	//Arrange
	var svs = new SingleValueSource();
	svs.Value(1);
	var vm = new SingleValueViewModel({valueSource:svs});
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
	var svs = new SingleValueSource();
	svs.Definition("0");
	var vm = new SingleValueViewModel({valueSource:svs});

	//Act
	vm.definition("1");

	//Assert
	equal(svs.Definition(), "1");
})

test("Setting requestedName on a SingleValueViewModel causes it to call trySetName on the sheet it was constructed with, ",function(){
	//Arrange
	var itemToAdd = new SheetElement(new SingleValueSource(), {x:0,y:0});
	
	var functionWasCalled = false;
	var itemPassedInFunction;
	var nameRequestedInFunction;
	var sheet = {trySetName:function(item, requestedName){
		functionWasCalled=true;
		itemPassedInFunction = item;
		nameRequestedInFunction = requestedName;
	}};

	var vm = new SingleValueViewModel(itemToAdd, sheet);

	//Act
	vm.requestedName("Foo");

	//Assert
	ok(functionWasCalled);
	strictEqual(itemPassedInFunction, itemToAdd);
	strictEqual(nameRequestedInFunction, "Foo");
});

test("SingleValueViewModel name property takes its value from name assigment in sheetVM", function(){
	//Arrange
	var sheetModel = new Sheet();
	var sheetVM = new SheetVM(sheetModel);

	var item = new SheetElement(new SingleValueSource(), {x:0,y:0})
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
	var sheetModel = new Sheet();
	var sheetVM = new SheetVM(sheetModel);
	var vmRaisedEvent = false;
	sheetVM.items.subscribe(function(){vmRaisedEvent = true});
	equal(sheetVM.items().length, 0);

	var itemToAdd = new SingleValueSource();

	//Act
	sheetModel.addItem({valueSource:itemToAdd});

	//Assert
	ok(vmRaisedEvent);
	equal(sheetVM.items().length, 1);
});

test("When sheet model raises nameAssigned for previously unnamed item, sheetVM adds name record to its nameAssignments collection", function(){
	//Arrange
	var sheet = new Sheet();
	var item = new SheetElement(new SingleValueSource(), {x:0,y:0});
	
	var sheetVM = new SheetVM(sheet);
	sheet.addItem(item);

	//Act
	sheet.trySetName(item, "Foo");


	//Assert
	equal(sheetVM.nameAssignments().length, 1);
});

test("When sheet model raises nameAssigned for previously named item, sheetVM replaces name record in its nameAssignments collection", function(){
	//Arrange
	var sheet = new Sheet();
	var item = new SheetElement(new SingleValueSource(), {x:0,y:0});
	
	var sheetVM = new SheetVM(sheet);
	sheet.addItem(item);
	sheet.trySetName(item, "Foo");


	//Act
	sheet.trySetName(item, "Bar");


	//Assert
	equal(sheetVM.nameAssignments().length, 1);
	equal(sheetVM.nameAssignments()[0].name, "Bar");
});

