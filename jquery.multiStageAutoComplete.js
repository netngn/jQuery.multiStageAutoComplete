jQuery.fn.extend({
  multiStageAutoComplete: function(options){
    var jQ = jQuery;
    var settings = $.extend({
    }, options || {});
    var textBox = this;
    var completedMatchedText = '';
    var dataSetComplete = false;
    var previousTextBoxValue = null; 
    var autoCompleteDataSetIndex = 0;
    var autoCompleteDataSet = settings.autoCompleteDataSet;
    var autoCompleteElementsSelected = { };
    var textTimeout = null;
    var blurredText = false;
    var methods = {
      selectTextRange: function(start, end)
      {
        var textBoxObject = $(textBox)[0];
        if(textBoxObject.setSelectionRange) {
            textBoxObject.focus();
            textBoxObject.setSelectionRange(start, end);
        } else if(textBoxObject.createTextRange) {
            var range = textBoxObject.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
      },
      resetautoComplete: function()
      {
        blurredText = false;
        dataSetComplete = false;
        completedMatchedText = '';
        previousTextBoxValue = null; 
        autoCompleteDataSetIndex = 0;
        autoCompleteElementsSelected = { };
      },
      finishAutoCompleteSet: function()
      {

          if(settings.onEnterKeyEvent != null) { settings.onEnterKeyEvent(); }
          dataSetComplete = true;
      },
      onTextChange: function()
      {
        if(dataSetComplete == true) { return; }
        var text = textBox.val();
        if(text == previousTextBoxValue) { return; }
        previousTextBoxValue = text;
        if(text.trim().length > 0)
        {
          methods.parseText(text, true);
        } else {
          methods.resetautoComplete();
        }
      },
      parseText: function(text, setText)
      {
           var searchData = autoCompleteDataSet[autoCompleteDataSetIndex]['data'];
           var numberTransform = autoCompleteDataSet[autoCompleteDataSetIndex]['numberTransform'];
           var matchedElementIndex;
           text = text.replace(completedMatchedText, '').replace(/^\s+/,"");
           if(searchData[0] instanceof Object)
           {
              searchData = searchData.map(function(value)
                {
                  return value['name'];
                }); 
           }
           if(numberTransform)
           {
             var number = text.match(/\d+/g);
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
         var startLength = 1;
         if(previousTextBoxValue)
         {
            startLength = previousTextBoxValue.length;
         }
         methods.selectTextRange(startLength, newText.length);
      },
      searchHash: function(text, array)
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
          var textValue = textBox.val().trim();
          if(textBox.val().indexOf(completedMatchedText) > -1)
          {
              textValue = textBox.val().replace(completedMatchedText, ''); 
          }
              if(methods.parseText(textValue.trim(), false))
              {
                methods.makeTransition();
              }
      },
      makeTransition: function()
      {
          completedMatchedText = textBox.val() + ' '; 
          if(autoCompleteDataSetIndex + 1 == autoCompleteDataSet.length || autoCompleteDataSet[autoCompleteDataSetIndex]['completesDataSet'])
          {

             return;
          } else {
            var transitionsTo = autoCompleteDataSet[autoCompleteDataSetIndex]['data'][autoCompleteElementsSelected[autoCompleteDataSetIndex]]['transitionsTo'];
            if(transitionsTo)
            {
              var transitionIndex = methods.searchHash(transitionsTo, autoCompleteDataSet);
              if(transitionIndex > -1)
              {

                autoCompleteDataSetIndex=transitionIndex;
                return;
              } else {
                  alert('transition error occurred');
              }

            }
              console.log('incrementing dataSetIndex');
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
            blurredText = false;
            if (textTimeout) clearTimeout(textTimeout);
            textTimeout = setTimeout(function(){ methods['onTextChange']();}, 50);
            break;
        }
    },
    currentSelectionContainsSpace: function()
    {
        var elementIndex = autoCompleteElementsSelected[autoCompleteDataSetIndex];
        var value = methods.grabSelectedValueFromDataSet(autoCompleteDataSetIndex, elementIndex, 'name');
        if(value.match(/\s+/g))
        {
           return true;
        }
        return false;
    },
    grabSelectedValueFromDataSet: function(dataSetIndex, elementIndex, hashKey)
    {
       var data = autoCompleteDataSet[dataSetIndex]['data'];
       if(data[0] instanceof Object)
       {
          return data[elementIndex][hashKey];
       }
       return data[elementIndex];
    },
    blurringText: function(e)
    {
      if(methods.currentSelectionContainsSpace()) { return; }
      if(document.getSelection && document.getSelection().type == "Range")
           {
              if(!blurredText) { e.preventDefault(); }
              textBox.blur().val(textBox.val()).focus();
              blurredText = true;
              return true;
            }
            return false;
    },
    onKeyDown: function(e)
    {
        switch(e.keyCode) {
          case 13: // return
            if(!methods.blurringText(e))
            {
              if(settings.onEnterKeyEvent != null)
              {
                e.preventDefault();
                settings.onEnterKeyEvent();
              }
            }
            break;
          case 32:
            if(!methods.blurringText(e))
            {
              methods.detectDataSetTransition();
            }
            break;
          case 9:  // tab
            methods.blurringText(e);
            break;
          case 27: // Escape
            methods.resetautoComplete();
            break;
          default:
            if(textBox.val() == '')
            {
                methods.resetautoComplete();
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
