jQuery.fn.extend({
  multiStageAutoComplete: function(options){
    var jQ = jQuery;
    var settings = $.extend({
    }, options || {});
    var textBox = this;
    var completedMatchedText = '';
    var previousTextBoxValue = null; 
    var autoCompleteDataSetIndex = 0;
    var autoCompleteElementsSelected = { };
    var textTimeout = null;
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
      resetAutoComplete: function()
      {
        completedMatchedText = '';
        previousTextBoxValue = null; 
        autoCompleteDataSetIndex = 0;
        autoCompleteElementsSelected = { };
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
           var numberTransform = settings.autoCompleteDataSet[autoCompleteDataSetIndex]['numberTransform'];
           var matchedElementIndex;
           var originalWords = text.split(' ');

           if(searchData[0] instanceof Object)
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
         var startLength = 0;
         if(previousTextBoxValue)
         {
            startLength = previousTextBoxValue.length;
         }
         methods.selectTextRange(startLength, newText.length);
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
      makeTransition: function()
      {
          completedMatchedText = textBox.val(); 
          
          if(autoCompleteDataSetIndex + 1 == autoCompleteDataSet.length || autoCompleteDataSet[autoCompleteDataSetIndex]['completesDataSet'])
          {

             if(settings.fireEnterKeyEventOnComplete && settings.onEnterKeyEvent != null) { settings.onEnterKeyEvent(); }
             return;
          } else {
            var transitionsTo = autocompleteDataSet[autoCompleteDataSetIndex][autoCompleteElementsSelected[autoCompleteDataSetIndex]]['transitionsTo'];
            if(transitionsTo)
            {
              var transitionIndex = searchHash(transitionsTo, autocompleteDataSet);
              if(transitionIndex > -1)
              {

                autoCompleteDataSetIndex=transitionIndex;
              } else {
                  alert('transition error occurred');
              }

            }
              autoCompleteDataSetIndex++;
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
            methods.detectDataSetTransition();
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
      setupMultiStageAutoComplete: function()
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
      if(settings.autoCompleteDataSet == null) { return; }
      methods['setupMultiStageAutoComplete'].apply( this );
    });
  }
});
