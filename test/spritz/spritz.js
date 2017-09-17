function spritzify(input, output, wpm, no_preprocess){
    var words_per_minute = wpm;
    var ms_per_word = 60000/wpm;

    var all_words;

    var word = '';
    var result = '';

    if (no_preprocess) {
        all_words = input;
    }
    else {
        all_words = input.split(' ');
        // Preprocess words
        var temp_words = all_words.slice(0); // copy Array
        var t = 0;

        for (var i=0; i<all_words.length; i++){

            if(all_words[i].indexOf('.') != -1){
                temp_words[t] = all_words[i].replace('.', '•');
            }

            // Double up on long words and words with commas.
            if((all_words[i].indexOf(',') != -1 || all_words[i].indexOf(':') != -1 || all_words[i].indexOf('-') != -1 || all_words[i].indexOf('(') != -1|| all_words[i].length > 8) && all_words[i].indexOf('.') == -1){
                temp_words.splice(t+1, 0, all_words[i]);
                temp_words.splice(t+1, 0, all_words[i]);
                t++;
                t++;
            }

            // Add an additional space after punctuation.
            if(all_words[i].indexOf('.') != -1 || all_words[i].indexOf('!') != -1 || all_words[i].indexOf('?') != -1 || all_words[i].indexOf(':') != -1 || all_words[i].indexOf(';') != -1|| all_words[i].indexOf(')') != -1){
                temp_words.splice(t+1, 0, ".");
                temp_words.splice(t+1, 0, ".");
                temp_words.splice(t+1, 0, ".");
                t++;
                t++;
                t++;
            }

            t++;

        }
        all_words = temp_words.slice(0);
    }

    // Set the timers!
    for (var i=0; i<all_words.length; i++){
        setTimeout(function(x) {
            return function() {

                var p = pivot(all_words[x]);
                $(output).html(p);

        }; }(i), ms_per_word * i);

    }
}

function pivot(word){
    var length = word.length;

    if(length<6){

        var bit = 1;
        while(word.length < 22){
            if(bit > 0){
                word = word + '.';
            }
            else{
                word = '.' + word;
            }
            bit = bit * -1;
        }

        var start = '';
        var end = '';
        var pos = word.length/2;
        if (start.charAt(pos) === ' ') {
            pos++;
        }
        start = word.slice(0, pos);
        end = word.slice(pos, word.length);

        var result;
        result = "<span class='start'>" + start.slice(0, start.length -1);
        result = result + "</span><span class='pivot'>";
        result = result + start.slice(start.length-1, start.length);
        result = result + "</span><span class='end'>";
        result = result + end;
        result = result + "</span>";
    }

    else{

        var tail = 40 - (word.length + 7);
        word = '.......' + word + ('.'.repeat(tail));

        var start = word.slice(0, word.length/2);
        var end = word.slice(word.length/2, word.length);

        var result;
        result = "<span class='start'>" + start.slice(0, start.length -1);
        result = result + "</span><span class='pivot'>";
        result = result + start.slice(start.length-1, start.length);
        result = result + "</span><span class='end'>";
        result = result + end;
        result = result + "</span>";

    }

    result = result.replace(/\./g, "<span class='invisible'>.</span>");

    return result;
}

// This is a hack using the fact that browers sequentially id the timers.
function clearTimeouts(){
    var id = window.setTimeout(function() {}, 0);

    while (id--) {
        window.clearTimeout(id);
    }
}

String.prototype.repeat = function( num ) {
    return new Array( num + 1 ).join( this );
}
