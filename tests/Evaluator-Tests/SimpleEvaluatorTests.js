module("SimpleEvaluatorTests");

test( "Given input which does not start with '=', returns input without modification", function() {
	var evaluator = new SimpleEvaluator();

	equal(evaluator.evaluate("hello"), "hello");
	equal(evaluator.evaluate(1), 1);
});