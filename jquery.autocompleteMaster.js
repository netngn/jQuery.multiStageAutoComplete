jQuery.fn.extend({
  cropBehind: function(options){
    var jQ = jQuery;
    var settings = $.extend({
    }, options || {});
    var completedMatchedText = '';
    var textBox = this;
    var previousTextBoxValue = null; 
    var autoCompleteDataSetIndex = 0;
    var autoCompleteElementsSelected = { };
    var textTimeout = null;
    var currentlyMatching = false;
    var methods = {
      selectTextRange: function(start, end)
      {
        if(textBox.setSelectionRange) {
            textBox.focus();
            textBox.setSelectionRange(start, end);
        } else if(textBox.createTextRange) {
            var range = textBox.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
      },
      onTextChange: function()
      {
        var text = textBox.val();
        if(text == previousTextBoxValue) { return; }
        previouseTextBoxValue = text;
        if(text.trim().length > 0)
        {
          methods.parseText(text, true);
        } else {
          methods.resetAutoComplete();
        }
      },
      parseText: function(text, setText)
      {
           var searchData = settings.autoCompleteDataSet[autoCompleteDataSetIndex]['data'];
           var numberTransform = settings.autoCompleteDataSet[autoCompleteDataIndex]['numberTransform'];
           var matchedElementIndex;
           var originalWords = text.split(' ');

           if(searchData[0] instanceof Hash)
           {
              searchData = searchData.map(function(value)
                {
                  return value['name'];
                }); 
           }
           if(numberTransform)
           {
             var number = nextWord.match(/\d+/g);
             if(number > 0)
               searchData = searchData.map(function(value) { return value.replace('\d', number); });
           }
            matchedElementIndex = methods.searchArray(text, searchData);

           if(matchedElementIndex > -1)
           {
             autoCompleteElementsSelected[autoCompleteDataSetIndex] =matchedElementIndex;
             var newText = completedMatchedText + searchData[matchedElementIndex];
             if(setText) { this.setNewTextBoxValue(newText); } 
             return true;
           }
           return false;
      },
      setNewTextBoxValue: function(newText)
      {
         textBox.val(newText);
         methods.selectTextRange(previousTextBoxValue.length, newText.length);
      },
      searchHash: function(array)
      {
        var matcher = new RegExp('^' + text, "i");
        for(i=0;i<array.length;i++){
            if(matcher.test(array[i]['name'])){
              return i;
            }
          }
        return -1;
      },
      searchArray: function(text, array)
      {
        var matcher = new RegExp('^' + text, "i");
        for(i=0;i<array.length;i++){
            if(matcher.test(array[i])){
              return i;
            }
          }
        return -1;
      },
      detectDataSetTransition: function()
      {
          if(completedMatchedText == '')
          {

          } else if(textBox.val().indexof(completedMatchedText) > -1)
          {
              var textValue = textBox.val().replace(completedMatchedText, ''); 
              if(parseText(textValue.trim(), false))
              {

              }

          }
      },
    onKeyPress: function(e)
    {
        switch(e.keyCode) {
          case 13: // return
          case 9: // tab
            return;
            break;
          default:
            if (textTimeout) clearTimeout(textTimeout);
            textTimeout = setTimeout(function(){ methods['onTextChange']();}, 50);
            break;
        }
    },
    onKeyDown: function(e)
    {
        switch(e.keyCode) {
          case 13: // return
            if(methods.onEnterKeyEvent != null)
            {
              e.preventDefault();
              methods.onEnterKeyEvent();
            }
            break;
          case 32:
            methods.detectTransition();
            break;
          case 9:  // tab
            e.preventDefault();
            textBox.blur().val(textBox.val()).focus();
            break;
          case 27: // Escape
            methods.resetAutoComplete();
            break;
          default:
            if(textBox.val() == '')
            {
                methods.resetAutoComplete();
            }
            break;
        }
    },
      setupAutoCompleteMaster: function()
      {

        $(textBox).keydown(function(e){
          methods['onKeyDown'](e);
        });
        $(textBox).keypress(function(e){
          methods['onKeyPress'](e);
        });
      }
    };
    return this.each(function(){
      if(settings.data == null) { return; }
      methods['setupAutoCompleteMaster'].apply( this );
    });
  }
});
