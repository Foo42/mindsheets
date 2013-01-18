define([],function(){
    var module = {};
    
    module.SimpleEvaluator = (function(){
    	
    	var shouldEvaluateAsExpression = function(input){
    		return typeof(input) === 'string' && input[0] === '=';
    	}
    
    	return function(){
    		var self = this;
    
    		//Private
    		var applyOperator = function (terms, operatorFunction) {
    			var total =  evaluateExpression(terms[0]);
    			for (var i = 1; i < terms.length; i++) {
    				var term = terms[i];
    				total = operatorFunction(total, evaluateExpression(term));
    			};
    			return total;			
    		}
    
    		//Private
    		var evaluateExpression = function(expression){
    			var operators = [
    				
    				{op:'+',
    				func:function(terms){
    					return applyOperator(terms, function (operand1, operand2){
    						return operand1 + operand2;
    					});
    				}},
    
    				{op:'-',
    				func:function(terms){
    					return applyOperator(terms, function (operand1, operand2){
    						return operand1 - operand2;
    					});
    				}},
    
    				{op:'*',
    				func:function(terms){
    					return applyOperator(terms, function (operand1, operand2){
    						return operand1 * operand2;
    					});
    				}},
    
    				{op:'/',
    				func:function(terms){
    					return applyOperator(terms, function (operand1, operand2){
    						return operand1 / operand2;
    					});
    				}}
    			];
    
    			//Find first operator which appears
    			for (var i = 0; i < operators.length; i++) {
    				var operator = operators[i];
    				var pieces = expression.split(operator.op);
    				if(pieces.length > 1)
    				{
    					//apply operator
    					return operator.func(pieces);
    				}
    
    			};
    
    			//No operators found, treat as plain value
    			return parseInt(expression);					
    		}
    
    		//Public
    		self.evaluate = function(expression){
    			if(shouldEvaluateAsExpression(expression))
    			{
    				//remove the leading equals
    				expression = expression.slice(1);
    				return evaluateExpression(expression);
    			}
    			
    			return expression;
    		}
    	}
    })();
    
    return module;
});