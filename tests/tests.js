test( "hello test", function() {
  ok( 1 == "1", "Passed!" );
});

test("can create SingleValueSource", function() {
	var svs = new SingleValueSource();
	ok( svs != null);
})

test("SingleValueSource has default value of null", function(){
	var svs = new SingleValueSource();
	strictEqual(svs.Value(), null);
})

test("Can set and retrieve value on a SingleValueSource", function(){
	var svs = new SingleValueSource();
	svs.Value(4);
	strictEqual(svs.Value(), 4);
})

test("setting a value on a SingleValueSource raises value change event with the new value", function(){
	var svs = new SingleValueSource();
	var eventFired = false;
	var valueFromEvent;
	svs.bind("valueChanged", function(newValue){
		eventFired = true;
		valueFromEvent = newValue;
	});

	svs.Value(4);

	ok(eventFired);
	strictEqual(valueFromEvent, 4);
})

test("Adding an item to the sheet raises an itemAdded event on the sheet with the new item as an event argument", function(){
	var svs = new SingleValueSource();
	var sheet = new Sheet();

	var eventFired = false;
	var itemInEvent = null;
	sheet.bind("itemAdded", function(item){
		eventFired = true;
		itemInEvent = item;
	});

	sheet.addItem(svs);
	
	ok(eventFired);
	strictEqual(itemInEvent, svs);
})

