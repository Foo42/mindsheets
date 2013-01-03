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