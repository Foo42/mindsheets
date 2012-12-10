var SimpleEvaluator = (function(){
	return function(){
		var self = this;
		
		self.evaluate = function(expression){
			if(expression[0] === '=')
			{
				return 0;
			}
			
			return expression;
		}
	}
})();