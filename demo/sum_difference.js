function inherit(subClass, superClass) {
	var Temp = new Function();
	Temp.prototype = superClass.prototype;
	subClass.prototype = new Temp;
	subClass.prototype.constructor = subClass;
	subClass.prototype.superclass = superClass.prototype;
}


function reprTuple(array)
{
	var resultArray = [];
	for (var i = 0; i < array.length; i++) {
		if (array[i] instanceof Array) {
			resultArray.push(reprTuple(array[i]));
		} else {
			resultArray.push(array[i]);
		}
	}
//	return "(" + resultArray.join(",") + ")";
	return "[" +  resultArray.join("") + "]";
}

function getArrayShortCopy(array, count)
{
	var result = [];
	for (var i = 0; i < array.length - count; i++) {
		result[i] = array[i];
	}
	return result;
}

var nullTuple = [];

var Control = function() {
	this._control = null;
}

Control.prototype.createControl = function(classNames) {
	this._control = $('<div />').addClass(classNames).text(this.repr()).appendTo('body').hide();
}

Control.prototype.getControl = function() {
	return this._control;
}

Control.prototype.update = function() {
	this._control.text(this.repr());
}

Control.prototype.highlight = function(color) {
	this._origBorderColor = this._control.css('border-left-color');
	this._control.addClass('highlight');
	if (!color) color = 'red';
	this._control.css({'border-color' : color});
}

Control.prototype.unhighlight = function() {
	this._control.css({'border-color' : this._origBorderColor});
	delete this._origBorderColor;
	this._control.removeClass('highlight');
}

Control.prototype.repr = function() { throw "virtual function"; }

var Path = function(labelSequenceTuple) {
	this._labelSequenceTuple = labelSequenceTuple;
	this._w = 1.0;
	this._W = 1.0;
	this._alpha = 0.0;
	this._beta = 0.0;
	this._gamma = 0.0;
	this._delta = 0.0;
	this._sigma = 0.0;
	this._features = [];
	this._prevPath = null;
	this._longestSuffix = null;
	this.createControl('common path');
}

inherit(Path, Control);

Path.prototype.repr = function() {
	var result = sprintf('%6s', reprTuple(this._labelSequenceTuple));
	result += ':w' + sprintf('%5.2f', this._w) + ' W' + sprintf('%5.2f', this._W) + ' \u03c3' + sprintf('%5.2f', this._sigma) + "\n\u03b1" +
	                sprintf('%5.2f', this._alpha) + ' \u03b3' + sprintf('%5.2f', this._gamma) + ' \u03b2' + 
	                sprintf('%5.2f', this._beta) + ' \u03b4' + sprintf('%5.2f', this._delta);
	result.replace(/ /g, '\u00A0');
	return result;
}

Path.prototype.getLabelSequenceTuple = function() {
	return this._labelSequenceTuple;
}

Path.prototype.isEmpty = function() {
	return this.getLabelSequenceTuple().length == 0;
}

Path.prototype.getw = function() {
	return this._w;
}

Path.prototype.setw = function(w) {
	this._w = w;
	this.update();
}

Path.prototype.getW = function() {
	return this._W;
}

Path.prototype.setW = function(W) {
	this._W = W;
	this.update();
}

Path.prototype.setAlpha = function(alpha) {
	this._alpha = alpha;
	this.update();
}

Path.prototype.getAlpha = function() {
	return this._alpha;
}

Path.prototype.setBeta = function(beta) {
	this._beta = beta;
	this.update();
}

Path.prototype.getBeta = function() {
	return this._beta;
}

Path.prototype.setGamma = function(gamma) {
	this._gamma = gamma;
	this.update();
}

Path.prototype.getGamma = function() {
	return this._gamma;
}

Path.prototype.setDelta = function(delta) {
	this._delta = delta;
	this.update();
}

Path.prototype.getDelta = function() {
	return this._delta;
}

Path.prototype.setSigma = function(sigma) {
	this._sigma = sigma;
	this.update();
}

Path.prototype.getSigma = function() {
	return this._sigma;
}

Path.prototype.addFeature = function(feature) {
	this._w *= feature.getExpWeight();
	this._features.push(feature);
	this.update();
}

Path.prototype.setPrevPath = function(path) {
	this._prevPath = path;
}

Path.prototype.getPrevPath = function() {
	return this._prevPath;
}

Path.prototype.setLongestSuffix = function(path) {
	this._longestSuffix = path;
}

Path.prototype.getLongestSuffix = function() {
	return this._longestSuffix;
}

Path.prototype.highlightPrev = function() {
	if (this.getPrevPath()) this.getPrevPath().highlight("yellow");
}

Path.prototype.highlightLongestSuffix = function() {
	if (this.getLongestSuffix()) this.getLongestSuffix().highlight("blue");
}

Path.prototype.highlightAll = function() {
	this.highlightPrev();
	this.highlightLongestSuffix();
	this.highlight();
}

Path.prototype.highlightThisAndLongestSuffix = function() {
	this.highlightLongestSuffix();
	this.highlight();
}

Path.prototype.unhighlightAll = function() {
	this.unhighlight();
	if (this.getLongestSuffix()) this.getLongestSuffix().unhighlight();
	if (this.getPrevPath()) this.getPrevPath().unhighlight();
}

function compareLabelSequence(a, b)
{
	var labelSequenceTupleA = a.getLabelSequenceTuple();
	var labelSequenceTupleB = b.getLabelSequenceTuple();
	var lenA = labelSequenceTupleA.length;
	var lenB = labelSequenceTupleB.length;
	
	for (var i = 0; i < Math.min(lenA, lenB); i++) {
		if (labelSequenceTupleA[lenA-i-1] != labelSequenceTupleB[lenB-i-1]) {
			return (labelSequenceTupleA[lenA-i-1] > labelSequenceTupleB[lenB-i-1] ? 1 :
				(labelSequenceTupleA[lenA-i-1] < labelSequenceTupleB[lenB-i-1] ? -1 : 0));
		}
	}
	if (lenA != lenB) {
		return lenA - lenB;
	}
}

function getCommonSuffixLen(pathA, pathB)
{
	if (!(pathA instanceof Path) || !(pathB instanceof Path)) throw("argument type is not Path");
	var labelSequenceTupleA = pathA.getLabelSequenceTuple();
	var labelSequenceTupleB = pathB.getLabelSequenceTuple();
	var matchLen = 0;
	LOOP:
	for (var i = 0; i < Math.min(labelSequenceTupleA.length, labelSequenceTupleB.length); i++) {
		if (labelSequenceTupleA[labelSequenceTupleA.length-i-1] != labelSequenceTupleB[labelSequenceTupleB.length-i-1]) {
			break;
		} else {
			matchLen += 1;
		}
	}
	return matchLen;
}

var Feature = function(attr, labelSequence, observationCount) {
	this._attr = attr;
	this._labelSequenceTuple = labelSequence;
	this._weight = 0.0;
	this._expWeight = 1.0;
	this._observationCount = observationCount;
	this._expectation = 0.0;
	this.createControl('common feature');
}

inherit(Feature, Control);

Feature.prototype.repr = function() {
	var result = this._attr + ':' + reprTuple(this._labelSequenceTuple);
	result += ':' + sprintf('%.2f', this._expWeight);
	return result;
}

Feature.prototype.getAttr = function() {
	return this._attr;
}

Feature.prototype.getLabelSequenceTuple = function() {
	return this._labelSequenceTuple;
}

Feature.prototype.getWeight = function() {
	return this._weight;
}

Feature.prototype.getExpWeight = function() {
	return this._expWeight;
}

Feature.prototype.setWeight = function(weight) {
	this._weight = weight;
	this._expWeight = Math.exp(weight);
	this.update();
}

Feature.prototype.setExpWeight = function(expWeight) {
	this._expWeight = expWeight;
	this._weight = Math.log(expWeight);
	this.update();
}

Feature.prototype.setExpectation = function(expectation) {
	this._expectation = expectation;
}

var DataSet = function(text) {
	this._data = [];
	var sequence = [];
	var lines = text.split("\n");
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i].replace(/^\s+/, '').replace(/\s+$/, '');
		if (line.length == 0) {
			if (sequence.length > 0) {
				this._data.push(sequence);
			}
			sequence = [];
		} else {
			var attrs = line.split(/\s+/);
			var label = attrs.shift();
			sequence.push([label, attrs]);
		}
	}
	this._allFeatureList = [];
	this._attrToFeatureMap = {};

	var featureArray = this.getFeatureArray();
	var weightCounter = 1;
	for (var i = 0; i < featureArray.length; i++) {
		feature = featureArray[i];
//		feature.setWeight(Math.random() * 2 - 1);
		feature.setExpWeight(weightCounter / 10);
		weightCounter++;
		
		this._allFeatureList.push(feature);
		var attr = feature.getAttr();
		if (!(attr in this._attrToFeatureMap)) {
			this._attrToFeatureMap[attr] = [];
		}
		this._attrToFeatureMap[attr].push(feature);
		feature.getControl().appendTo(this._featureContainer).show();
	}
	
	var top = 0;
	this._featureContainer = $('<div />').addClass('common container').css(
		{ position: 'absolute', float: 'left', width: '1200px'}).appendTo('body').show();
	for (var featureIndex = 0; featureIndex < this._allFeatureList.length; featureIndex++) {
		this._allFeatureList[featureIndex].getControl().appendTo(this._featureContainer).show();
	}
	top += this._featureContainer.attr('offsetHeight') + 20;

	this._boxHeight = top;

	return;
}

DataSet.prototype.getFeatureArray = function() {
	// placeholder / should be extracted from the data set in real-world applications
	var featureArray = [];
	mapData = {
		"a0" : [["X"], ["Y"], ["Z"], ["E"], ["B", "X"], ["B", "X", "Y"],
			["X", "Y"], ["X", "Y", "Z"], ["Y", "X"], ["Y", "Z"], ["Z", "Y"],
			["X", "E"], ["Y", "E"], ["Z", "E"], ["Z", "Y", "E"], ["Y", "Z", "E"]],
		"a1" : [["X"], ["Y"], ["Z"], ["B", "X"], ["X", "Y"]],
		"a2" : [["X"], ["Y"], ["Z"]],
		"a3" : [["Y", "Y", "Y"], ["Y"], ["Z"], ["Y", "Z"]],
		"a4" : [["Z", "E"]]
	}
	/*
	mapData = {
		"" : [["B", "X"], ["X"], ["Y"], ["Z"], ["X", "Y"], ["Y", "Z"], ["Z", "E"], ["X", "E"],
			  ["Y", "E"], ["B", "Y"], ["B", "Z"], ["E"]],
		"a1" : [["X"], ["Y"]],
		"a2" : [["X"]],
		"a3" : [["Z"]]
	};
	*/
	for (var attr in mapData) {
		var labelSequences = mapData[attr];
		for (var i = 0; i < labelSequences.length; i++) {
			featureArray.push(new Feature(attr, labelSequences[i]));
		}
	}
	return featureArray;
}

DataSet.prototype.updateFeatureExpectation = function() {
	for (var i = 0; i < this._data.length; i++) {
		var sequence = this._data[i];
		var gen = this.sumDifference(sequence);
		while(1) { yield gen.next(); }
	}
}

DataSet.prototype.sumDifference = function(sequence) {

	var Display = function(top, right) {
		this._top = top;
		this._right = right;
		this._maxWidth = 0;
		this._topArray = [];
	}

	Display.prototype.add = function(path) {
		var control = path.getControl();
		var width = control.width();
		if (width > this._maxWidth) this._maxWidth = width;
		control.css({
			'top': this._top,
			'left': this._right - path.getControl().width(),
			'position':'absolute'}).show();
		this._topArray.push(this._top);
		this._top += control.height() + 8;
	}
	
	Display.prototype.reorder = function(paths, newLeft) {
		for (var i = 0; i < paths.length; ++i) {
			var path = paths[i];
			path.getControl().css({
				'top' : this._topArray[i]
			});
		}
	}

	Display.prototype.getMaxWidth = function() {
		return this._maxWidth;
	}

	var paths = [];
	var pathDict = [];

	var displayArray = [];
	var top = this._boxHeight + 10;
	var right = 230;
	var dummyArray = ['(BOS)', '"This"', '"is"', '"good"', '(EOS)'];
	var rightArray = [right];
	var startPath = new Path([]);
	startPath.setGamma(1.0);

	for (var sequencePos = 0; sequencePos < sequence.length; sequencePos++) {
		var maxWidth = 0;
		var attrs = sequence[sequencePos][1];
		for (var i = -1; i < attrs.length; i++) {
			var attr = (i == -1 ? "" : attrs[i]);
			if (!(attr in this._attrToFeatureMap)) continue;
			for (var j = 0; j < this._attrToFeatureMap[attr].length; j++) {
				var feature = this._attrToFeatureMap[attr][j];
				var labelSequenceTuple = feature.getLabelSequenceTuple();
				var len = labelSequenceTuple.length;
				if ((labelSequenceTuple[len-1] == "E" && !isEOS) ||
					(labelSequenceTuple[len-1] != "E" && isEOS)  ||
					(len > sequencePos && labelSequenceTuple[len-sequencePos-1] != "B") ||
					(len <= sequencePos && labelSequenceTuple[0] == "B")) {
					continue;
				}
				var width = (new Path(labelSequenceTuple)).getControl().width();
				if (width > maxWidth) maxWidth = width;
			}
		}
		right += maxWidth + 10;
		rightArray[sequencePos] = right;
		attrsControl = $('<div />').addClass('common attrs').text(dummyArray[sequencePos]+'/'+attrs.join(',')).appendTo('body').show();
		attrsControl.css({
			top : top,
			left: right - attrsControl.width(),
			position: 'absolute'
		})
	}
	yield 1;

	for (var sequencePos = 0; sequencePos < sequence.length; sequencePos++) {
		displayArray[sequencePos] = new Display(top + attrsControl.height(), rightArray[sequencePos]);
		paths[sequencePos] = [];
		pathDict[sequencePos] = {};
		var isEOS = (sequencePos == sequence.length - 1);
		var attrs = sequence[sequencePos][1];
		for (var i = -1; i < attrs.length; i++) {
			var attr = (i == -1 ? "" : attrs[i]);
			if (!(attr in this._attrToFeatureMap)) continue;
			for (var j = 0; j < this._attrToFeatureMap[attr].length; j++) {
				var feature = this._attrToFeatureMap[attr][j];
				var labelSequenceTuple = feature.getLabelSequenceTuple();
				var len = labelSequenceTuple.length;
				if ((labelSequenceTuple[len-1] == "E" && !isEOS) ||
					(labelSequenceTuple[len-1] != "E" && isEOS)  ||
					(len > sequencePos && labelSequenceTuple[len-sequencePos-1] != "B") ||
					(len <= sequencePos && labelSequenceTuple[0] == "B")) {
					continue;
				}
				feature.highlight();
				yield 0;
				feature.unhighlight();
				var lastPath = null;
				for (var k = 0; k <= Math.min(labelSequenceTuple.length, sequencePos); ++k) {
					var shortCopy = getArrayShortCopy(labelSequenceTuple, k);
					var repr = reprTuple(shortCopy);
					var path;
					var endFlag = false;
					var pathAlreadyExists = (repr in pathDict[sequencePos - k]);
					
					if (pathAlreadyExists) {
						path = pathDict[sequencePos - k][repr];
					} else {
						path = new Path(shortCopy);
						pathDict[sequencePos - k][repr] = path;
						paths[sequencePos - k].push(path);
						displayArray[sequencePos - k].add(path);
					}
					if (k == 0) path.addFeature(feature);
					if (lastPath) lastPath.setPrevPath(path);
					if (sequencePos - k == 0) path.setPrevPath(startPath);
					path.highlightAll();
					yield 0;
					path.unhighlightAll();
					lastPath = path;
					if (pathAlreadyExists) break;
				}
			}
		}
		yield 2;
	}

	var lastEmptyPath = new Path([]);
	lastEmptyPath.setDelta(1.0);
	displayArray[sequence.length - 1].add(lastEmptyPath);
	paths[sequence.length - 1].push(lastEmptyPath);

	// sort
	for (var sequencePos = 0; sequencePos < sequence.length; sequencePos++) {
		paths[sequencePos].sort(compareLabelSequence);
		displayArray[sequencePos].reorder(paths[sequencePos]);
		yield 1;
	}
	yield 2;
	
	// find the longest suffixes
	for (var sequencePos = 0; sequencePos < sequence.length; sequencePos++) {
		var prevPath = paths[sequencePos][0];
		var stack = [];
		for (var i = 1; i < paths[sequencePos].length; i++) {
			path = paths[sequencePos][i];
			var l = getCommonSuffixLen(path, prevPath);
			while (stack.length > 0 && stack[stack.length-1][0] > l) stack.pop();
			if (l == prevPath.getLabelSequenceTuple().length) stack.push([l, prevPath]);
			path.setLongestSuffix(stack[stack.length-1][1]);
			path.highlightThisAndLongestSuffix();
			yield 1;
			path.unhighlightAll();
			prevPath = path;
		}
		yield 2;
	}

	// sum weight
	for (var sequencePos = 0; sequencePos < sequence.length; sequencePos++) {
		for (var i = 1; i < paths[sequencePos].length; i++) {
			var path = paths[sequencePos][i];
			path.setW(path.getLongestSuffix().getW() * path.getw());
			path.highlightThisAndLongestSuffix();
			yield 1;
			path.unhighlightAll();
		}
		yield 2;
	}

	// forward
	for (var sequencePos = 0; sequencePos < sequence.length; sequencePos++) {
		// alpha
		for (var i = paths[sequencePos].length - 1; i >= 1; i--) {
			var path = paths[sequencePos][i];
			var prevPath = path.getPrevPath();
			var longestSuffix = path.getLongestSuffix();
			longestSuffix.setAlpha(longestSuffix.getAlpha() - prevPath.getGamma());
			path.setAlpha(path.getAlpha() + prevPath.getGamma());
			path.highlightAll();
			yield 1;
			path.unhighlightAll();
		}
		paths[sequencePos][0].setAlpha(0.0);

		// gamma
		for (var i = paths[sequencePos].length - 1; i >= 1; i--) {
			var path = paths[sequencePos][i];
			var longestSuffix = path.getLongestSuffix();
			path.setGamma(path.getGamma() + path.getAlpha() * path.getW());
			longestSuffix.setGamma(longestSuffix.getGamma() + path.getGamma());
			path.highlightThisAndLongestSuffix();
			yield 1;
			path.unhighlightAll();
		}
		yield 2;
	}
	
	// backward
	for (var sequencePos = sequence.length - 1; sequencePos >= 0; sequencePos--) {
		// beta
		paths[sequencePos][0].setBeta(paths[sequencePos][0].getDelta());
		for (var i = 1; i < paths[sequencePos].length; i++) {
			var path = paths[sequencePos][i];
			path.setBeta(path.getLongestSuffix().getBeta() + path.getDelta());
			path.highlightThisAndLongestSuffix();
			yield 1;
			path.unhighlightAll();
		}

		// delta
		for (var i = 1; i < paths[sequencePos].length; i++) {
			var path = paths[sequencePos][i];
			var prevPath = path.getPrevPath();
			var longestSuffix = path.getLongestSuffix();
			prevPath.setDelta(prevPath.getDelta() + path.getBeta() * path.getW());
			if (!longestSuffix.isEmpty()) prevPath.setDelta(prevPath.getDelta() - longestSuffix.getBeta() * longestSuffix.getW());
			path.highlightAll();
			yield 1;
			path.unhighlightAll();
		}
		yield 2;
	}
	
	// sum sigma
	for (var sequencePos = 0; sequencePos < sequence.length; sequencePos++) {
		for (var i = paths[sequencePos].length - 1; i >= 1; i--) {
			var path = paths[sequencePos][i];
			var longestSuffix = path.getLongestSuffix();
			path.setSigma(path.getSigma() + path.getAlpha() * path.getBeta() * path.getW());
			longestSuffix.setSigma(longestSuffix.getSigma() + path.getSigma());
			path.highlightThisAndLongestSuffix();
			yield 1;
			path.unhighlightAll();
		}
		yield 2;
	}
}

var generatorArray = [];
var curGenerator = null;

function main()
{
	var dataSet = new DataSet(
		"BOS\n" +
		"X a0 a1 a2\n" +
		"Y a0 a1\n" +
		"Z a0 a3\n" +
		"EOS a0 a4\n"
	);
	generatorArray.push(dataSet.updateFeatureExpectation());
	$(document).click(cont);
	1;
}

function cont(e)
{
	if (curGenerator) {
		try {
			if (e.shiftKey) {
				while (curGenerator.next() < 1);
			} else if (e.ctrlKey) {
				while (curGenerator.next() < 2);
			} else {
				curGenerator.next();
			}
		} catch(e if e instanceof StopIteration) {
			curGenerator = null;
		}
	}
	if (curGenerator == null) {
		if (generatorArray.length == 0) return;
		curGenerator = generatorArray.shift();
		curGenerator.next();
	}
	return false;
}

/*!{id:"uupaa.js",ver:0.7,license:"MIT",author:"uupaa.js@gmail.com"}*/
window.sprintf || (function() {
var _BITS = { i: 0x8011, d: 0x8011, u: 0x8021, o: 0x8161, x: 0x8261,
              X: 0x9261, f: 0x92, c: 0x2800, s: 0x84 },
    _PARSE = /%(?:(\d+)\$)?(#|0)?(\d+)?(?:\.(\d+))?(l)?([%iduoxXfcs])/g;

window.sprintf = _sprintf;

function _sprintf(format) {
  function _fmt(m, argidx, flag, width, prec, size, types) {
    if (types === "%") { return "%"; }
    var v = "", w = _BITS[types], overflow, pad;

    idx = argidx ? parseInt(argidx) : next++;

    w & 0x400 || (v = (av[idx] === void 0) ? "" : av[idx]);
    w & 3 && (v = (w & 1) ? parseInt(v) : parseFloat(v), v = isNaN(v) ? "": v);
    w & 4 && (v = ((types === "s" ? v : types) || "").toString());
    w & 0x20  && (v = (v >= 0) ? v : v % 0x100000000 + 0x100000000);
    w & 0x300 && (v = v.toString(w & 0x100 ? 8 : 16));
    w & 0x40  && (flag === "#") && (v = ((w & 0x100) ? "0" : "0x") + v);
    w & 0x80  && prec && (v = (w & 2) ? v.toFixed(prec) : v.slice(0, prec));
    w & 0x6000 && (overflow = (typeof v !== "number" || v < 0));
    w & 0x2000 && (v = overflow ? "" : String.fromCharCode(v));
    w & 0x8000 && (flag = (flag === "0") ? "" : flag);
    v = w & 0x1000 ? v.toString().toUpperCase() : v.toString();

    if (!(w & 0x800 || width === void 0 || v.length >= width)) {
      pad = Array(width - v.length + 1).join(!flag ? " " : flag === "#" ? " " : flag);
      v = ((w & 0x10 && flag === "0") && !v.indexOf("-"))
        ? ("-" + pad + v.slice(1)) : (pad + v);
    }
    return v;
  }
  var next = 1, idx = 0, av = arguments;

  return format.replace(_PARSE, _fmt);
}

})();
