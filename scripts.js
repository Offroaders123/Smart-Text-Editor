  var storage = window.localStorage, view = "text", orientation = "horizontal", refresh = "true", title = "true", transitions = "true", loadedFile = undefined, sourceChange = false, mustSave = false, activeWidget = undefined, activeModal = undefined, storedColor, insertColor = false, encodeComponent = false;

// --- Dropdown section
  var dropdowns = Array.from(document.getElementsByClassName("dropdown"));
  dropdowns.forEach(function(dropdown){
    var button = dropdown.getElementsByTagName("button")[0];
    var list = dropdown.getElementsByTagName("ul")[0];
    var listItems = Array.from(dropdown.getElementsByTagName("li"));
    listItems.forEach(function(listItem){
      var subListPresent = listItem.getElementsByTagName("ul")[0];
      if (subListPresent == undefined){
        listItem.addEventListener("click",function(){
          setTimeout(function(){
            dropdowns.forEach(function(dropdown){
              dropdown.classList.remove("active");
            });
          }, 50);
        });
      }
      listItem.addEventListener("keydown",function(event){
        if (event.key == "Enter"){
          listItem.click();
        }
      });
      listItem.setAttribute("tabindex","0");
      if (subListPresent != undefined){
        listItem.setAttribute("data-list","");
        listItem.addEventListener("mouseenter",function(){
          if (dropdown.classList.contains("active")){
            listItem.focus();
          }
        });
      }
    });
    button.addEventListener("click",function(){
      dropdowns.forEach(function(dropdown){
        dropdown.classList.toggle("active");
        if (dropdown.classList.contains("active")){
          document.body.addEventListener("click",disableDropdown);
        }
        function disableDropdown(event){
          if (dropdown.contains(event.target)) return;
          dropdowns.forEach(function(dropdown){
            if (dropdown.classList.contains("active")) return;
            dropdown.classList.remove("active");
            document.body.removeEventListener("click",disableDropdown);
          });
        }
        function hoverDropdown(){
          button.focus();
        }
      });
    });
    button.addEventListener("mouseenter",function(){
      if (dropdown.classList.contains("active")){
        button.focus();
      }
    });
    button.addEventListener("touchstart",function(event){
      if (dropdown.contains(event.targetTouches[0].target)) return;
      dropdowns.forEach(function(dropdown){
        dropdown.classList.remove("active");
      });
    });
  });
// --- Dropdown section

  var checkboxes = Array.from(document.getElementsByClassName("checkbox"));
  checkboxes.forEach(function(item){
    item.addEventListener("keydown",function(event){
      if (event.key == "Enter"){
        blockShortcut(event);
        item.getElementsByTagName("label")[0].click();
      }
    });
    item.setAttribute("tabindex","0");
  });

  var buttons = Array.from(document.getElementsByTagName("button"));
  buttons.forEach(function(item){
    item.addEventListener("click",function(){
      if (editingTools.contains(item) == false){
        item.focus();
      }
    });
  });

  var closeButtons = Array.from(document.getElementsByClassName("closeButton"));
  closeButtons.forEach(function(closeButton){
    closeButton.addEventListener("keydown",function(){
      if (event.key == "Enter"){
        blockShortcut(event);
        closeButton.onclick();
      }
    });
    closeButton.setAttribute("tabindex","0");
  });

  window.addEventListener("load",function(){
    if (windowParent){
      loadSettings("initial");
      setTimeout(function(){
        document.documentElement.classList.remove("fade");
      }, 50);
      if ("ontouchstart" in document.documentElement){
        openCard("editingTools");
      }
      if (title == "true"){
        setTimeout(function(){
          openCard("welcome");
        }, 100);
        setTimeout(function(){
          if (activeModal == "welcome"){
            closeCard("welcome");
          }
        }, 2100);
      }
      userInput.focus();
    }
    colorInputRefresh();
    forceRefresh();
    if ("serviceWorker" in navigator && windowParent && window.location.protocol == "https:"){
      navigator.serviceWorker.register("service-worker.js");
    }
  });
  window.addEventListener("beforeunload",function(){
    if (windowParent && mustSave){
      event.returnValue = "Changes you made may not be saved.";
    }
  });
  window.addEventListener("keydown",function(event){
    if (event.key == "Escape" && activeModal){
      blockShortcut(event);
      closeCard(activeModal);
    }
    if (event.ctrlKey){
      if (event.key == "C"){
        blockShortcut(event);
        window.open(window.location.href,"_blank");
      }
      if (event.key == "L"){
        blockShortcut(event);
        load.click();
      }
      if (event.key == "S"){
        blockShortcut(event);
        saveAs();
      }
      if (event.key == "!"){
        blockShortcut(event);
        changeView("text");
      }
      if (event.key == "@"){
        blockShortcut(event);
        changeView("code");
      }
      if (event.key == "#"){
        blockShortcut(event);
        changeView("split");
      }
      if (event.key == "$"){
        blockShortcut(event);
        changeView("preview");
      }
      if (event.key == "%"){
        blockShortcut(event);
        changeOrientation();
      }
      if (event.key == "^"){
        blockShortcut(event);
        openDisplay();
      }
      if (event.key == "Enter"){
        blockShortcut(event);
        if (view == "split"){
          forceRefresh();
        }
      }
      if (event.key == "E"){
        blockShortcut(event);
        openCard("editingTools");
      }
      if (event.key == "F"){
        blockShortcut(event);
        openCard("replacer");
      }
      if (event.key == "K"){
        blockShortcut(event);
        openCard("picker");
      }
      if (event.key == "G"){
        blockShortcut(event);
        importColor();
      }
      if (event.key == "R"){
        blockShortcut(event);
        openCard("formatter");
      }
      if (event.key == "Y"){
        blockShortcut(event);
        openCard("encoder");
      }
      if (event.key == "H"){
        blockShortcut(event);
        confirmOverwrite(insertTemplate);
      }
      if (event.key == ">"){
        blockShortcut(event);
        openCard("settings");
      }
    }
  });
  window.addEventListener("resize",function(){
    if (view == "split"){
      if (orientation == "vertical"){
        if (!header.getAttribute("style")){
          header.classList.add("resize");
          setTimeout(function(){
            header.classList.remove("resize");
          }, 50);
        }
      }
      changeView("split");
    }
  });
  document.documentElement.addEventListener("dragover",function(event){
    event.preventDefault();
    userInput.classList.add("drag");
    event.dataTransfer.dropEffect = "copy";
  });
  document.documentElement.addEventListener("dragleave",function(){
    userInput.classList.remove("drag");
  });
  document.documentElement.addEventListener("drop",function(event){
    event.preventDefault();
    userInput.classList.remove("drag");
    if (event.dataTransfer.types.includes("Files")){
      load.files = event.dataTransfer.files;
      confirmOverwrite(importFile,event);
    } else {
      textEdit("insert",event.dataTransfer.getData("text"),true);
    }
  });
  userInput.addEventListener("input",function(){
    sourceChange = true;
    mustSave = true;
    if (view == "split" || view == "preview"){
      previewRefresh();
    }
  });
  userInput.addEventListener("mousedown",function(){
    if (insertColor){
      insertColor = false;
    }
  });
  scaler.addEventListener("mousedown",function(){
    toggleScaling();
    document.body.addEventListener("mousemove",setScaling);
    document.body.addEventListener("mouseup",removeScaling);
    document.body.addEventListener("mouseleave",removeScaling);
  });
  load.addEventListener("change",function(event){
    confirmOverwrite(importFile,event);
  });
  colorInput.addEventListener("input",function(){
    colorInputRefresh();
    textEdit("insert",storedColor,true);
    colorInput.focus();
  });
  cardBackground.addEventListener("click",function(){
    if (activeModal == "welcome"){
      userInput.focus();
    }
    closeCard(activeModal);
  });
  welcome.addEventListener("click",function(){
    closeCard("welcome");
  });
  function loadSettings(input){
    var storedView = storage.getItem("view");
    if (storedView != undefined){
      if (input == "initial"){
        changeView(storedView);
      }
      updateSelect("view",storedView);
    }
    var storedOrientation = storage.getItem("orientation");
    if (storedOrientation != undefined){
      if (input == "initial"){
        changeOrientation(storedOrientation);
      }
      updateSelect("orientation",storedOrientation);
    }
    var storedRefresh = storage.getItem("refresh");
    if (storedRefresh != undefined){
      refresh = storedRefresh;
      updateCheckbox("refresh",storedRefresh);
    }
    var storedTitle = storage.getItem("title");
    if (storedTitle != undefined){
      title = storedTitle;
      updateCheckbox("title",storedTitle);
    }
    setTimeout(function(){
      var storedTransitions = storage.getItem("transitions");
      if (storedTransitions != undefined){
        changeTransitions(storedTransitions);
        updateCheckbox("transitions",storedTransitions);
      } else {
        changeTransitions(transitions);
      }
    }, 50);
  }
  function resetSettings(){
    var ask = confirm("Are you sure you want to reset all settings?\nThis cannot be undone.");
    if (ask){
      updateSelect("view","text");
      updateSelect("orientation","horizontal");
      refresh = "true";
      updateCheckbox("refresh","true");
      title = "true";
      updateCheckbox("title","true");
      changeTransitions("true");
      updateCheckbox("transitions","true");
      storage.clear();
      openCard("reset");
    }
  }
  function updateSetting(item,value){
    storage.setItem(item,value);
  }
  function updateSelect(item,value){
    updateSetting(item,value);
    document.getElementById(`${item}Setting`).innerHTML = updateCapitalization(value);
  }
  function updateCheckbox(item,value){
    if (value == undefined){
      value = document.getElementById(`${item}Setting`).checked;
    }
    if (value != undefined){
      if (value == "true"){
        document.getElementById(`${item}Setting`).checked = value;
      }
      if (value == "false"){
        document.getElementById(`${item}Setting`).removeAttribute("checked");
      }
    }
    updateSetting(item,value);
  }
  function updateCapitalization(value){
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  function changeView(input){
    var elements = ["header","main","userInput","scaler","preview"], newView = input;
    elements.forEach(function(item){
      changeClass(item,view,newView);
    });
    view = newView;
    previewRefresh();
  }
  function changeOrientation(input){
    var elements = ["header","main","userInput","scaler","preview"], newOrientation;
    if (input == undefined){
      if (orientation == "horizontal"){
        newOrientation = "vertical";
      }
      if (orientation == "vertical"){
        newOrientation = "horizontal";
      }
      changeView("code");
      setTimeout(function(){
        elements.forEach(function(item){
          changeClass(item,orientation,newOrientation);
        });
        scaler.style.transition = "none";
        preview.style.transition = "none";
        orientation = newOrientation;
      }, 500);
      setTimeout(function(){
        changeView("split");
      }, 550);
    } else {
      newOrientation = input;
      elements.forEach(function(item){
        changeClass(item,orientation,newOrientation);
      });
      orientation = newOrientation;
    }
  }
  function changeClass(element,variable,newVariable){
    document.getElementById(element).classList.remove(variable);
    document.getElementById(element).removeAttribute("style");
    document.getElementById(element).classList.add(newVariable);
  }
  function changeTransitions(input){
    var newTransition = input;
    if (newTransition == "true"){
      document.documentElement.removeAttribute("style");
    }
    if (newTransition == "false"){
      document.documentElement.style = removeTransitions;
    }
    transitions = newTransition;
  }
  function confirmOverwrite(action,event){
    if (mustSave){
      var ask = confirm("Changes you made may not be saved.");
      if (ask){
        action(event);
        closeCard(activeModal);
      }
    } else {
      action(event);
      closeCard(activeModal);
    }
  }
  function blockShortcut(event){
    event.preventDefault();
    event.stopPropagation();
  }
  function importFile(event){
    closeCard(activeModal);
    var reader = new FileReader(), validTypes = ["text","image","audio"], validSubtypes = ["plain","css","javascript","json","html","svg+xml"], mimeType = load.files[0].type;
    function mimeDivision(index){
      return mimeType.split("/")[index];
    }
    if (mimeDivision(1) == validSubtypes[3] || mimeDivision(1) == validSubtypes[5]){
      mimeType = mimeType.replace(mimeDivision(0),validTypes[0]);
    }
    if (validTypes.includes(mimeDivision(0))){
      if (validTypes[0] == mimeDivision(0)){
        reader.readAsText(load.files[0],"UTF-8");
        reader.addEventListener("loadend",function(){
          userInput.value = reader.result;
          sourceChange = true;
          mustSave = false;
          previewRefresh();
        });
        loadedFile = load.files[0].name;
        if (validSubtypes[0] == mimeDivision(1)){
          changeView("text");
        }
        if (validSubtypes.slice(1,4).includes(mimeDivision(1))){
          changeView("code");
        }
        if (validSubtypes.slice(4,6).includes(mimeDivision(1))){
          changeView("split");
        }
      }
      if (validTypes.slice(1,3).includes(mimeDivision(0))){
        reader.readAsDataURL(load.files[0]);
        reader.addEventListener("loadend",function(){
          textEdit("insert",reader.result,true);
        });
      }
    } else {
      alert("Sorry, that file type isn't supported.");
    }
  }
  function saveAs(extension){
    var blob = new Blob([userInput.value],{type: "text/plain"});
    save.href = URL.createObjectURL(blob);
    if (extension == undefined){
      if (loadedFile != undefined){
        save.download = loadedFile;
      } else {
        save.download = "Untitled.txt";
      }
    } else {
      save.download = `Untitled.${extension}`;
    }
    save.addEventListener("click",function(event){
      event.stopPropagation();
    });
    save.click();
    loadedFile = save.download;
    mustSave = false;
  }
  function openDisplay(){
    var screenDimensions = [window.screen.width, window.screen.height], display = window.open("","_blank",`left=${screenDimensions[0] / 6},top=${screenDimensions[1] / 6 - 40},width=${screenDimensions[0] * 2/3},height=${screenDimensions[1] * 2/3}`);
    display.document.open();
    display.document.write(userInput.value);
    display.document.close();
  }
  function textEdit(type,text,focus){
    var cursor = userInput.selectionStart;
    if (focus == true){
      userInput.focus();
    }
    if (type == "insert"){
      userInput.setRangeText(text);
      userInput.setSelectionRange(cursor,cursor + text.length);
    }
    if (type == "delete"){
      userInput.setSelectionRange(cursor,cursor + text);
      userInput.setRangeText("");
    }
    sourceChange = true;
    mustSave = true;
    previewRefresh();
  }
  function openCard(element){
    var card = document.getElementById(element);
    var cardType = card.classList[1];
    if (card.classList.contains("active")){
      card.classList.toggle("active");
      if (cardType == "modal"){
        cardBackground.classList.toggle("active");
      }
    } else {
      var cards = Array.from(document.getElementsByClassName("card"));
      if (cardType != "notification"){
        cards.forEach(function(item){
          var itemType = item.classList[1];
          if (itemType == cardType || itemType == "modal"){
            item.classList.remove("active");
          }
        });
      }
      if (cardType != "notification" && cardType != "modal"){
        cardBackground.classList.remove("active");
      }
      card.classList.add("active");
      if (cardType == "notification"){
        setTimeout(function(){
          closeCard(element);
        }, 3000);
      }
      if (cardType == "modal"){
        cardBackground.classList.add("active");
      }
    }
    if (cardType == "widget"){
      activeWidget = element;
    }
    if (cardType == "modal"){
      activeModal = element;
    }
  }
  function closeCard(element){
    if (element == undefined) return;
    var card = document.getElementById(element);
    var cardType = card.classList[1];
    document.getElementById(element).classList.remove("active");
    if (cardType == "modal"){
      cardBackground.classList.remove("active");
    }
    if (activeModal == "welcome" && windowParent){
      userInput.focus();
    }
    if (activeModal == "settings" && windowParent){
      loadSettings();
    }
    if (cardType == "widget"){
      activeWidget = undefined;
    }
    if (cardType == "modal"){
      activeModal = undefined;
    }
  }
  function changeState(history){
    userInput.focus();
    document.execCommand(history);
  }
  function insertText(text){
    userInput.focus();
    document.execCommand("insertText",false,text);
  }
  function activateReplacer(){
    userInput.value = userInput.value.split(locate.value).join(modify.value);
    sourceChange = true;
    mustSave = true;
    previewRefresh();
  }
  function colorInputRefresh(){
    var get = colorInput.value.replace("#","");
    if (get.length == 3 || get.length == 6){
      storedColor = get;
      if (storedColor.length == 3){
        storedColor = storedColor.match(/.{1}/g);
        storedColor.forEach(function(item,index){
          storedColor[index] = item + item;
        });
      }
      if (storedColor.length == 6){
        storedColor = storedColor.match(/.{1,2}/g);
      }
      storedColor.forEach(function(item,index){
        storedColor[index] = parseInt(item,16);
      });
      redChannel.value = storedColor[0];
      greenChannel.value = storedColor[1];
      blueChannel.value = storedColor[2];
      storedColor = `#${convertHex(redChannel.value)}${convertHex(greenChannel.value)}${convertHex(blueChannel.value)}`;
      colorPreview.style.background = storedColor;
    }
  }
  function channelRefresh(){
    storedColor = `#${convertHex(redChannel.value)}${convertHex(greenChannel.value)}${convertHex(blueChannel.value)}`;
    colorPreview.style.background = storedColor;
    colorInput.value = storedColor;
    if (insertColor){
      textEdit("insert",storedColor,true);
    }
  }
  function convertHex(channel){
    var hex = parseInt(channel).toString(16);
    if (hex.length == 1){
      hex = 0 + hex;
    }
    return hex;
  }
  function importColor(){
    insertColor = true;
    if (!picker.classList.contains("active")){
      openCard("picker");
    }
    if (window.getSelection().toString().length > 0){
      colorInput.value = window.getSelection();
    }
    colorInput.focus();
    colorInputRefresh();
  }
  function activateFormatter(format){
    try {
      formatterInput.value = JSON.stringify(JSON.parse(formatterInput.value),false,format);
    } catch (error){
      alert("Invalid JSON data.");
    }
  }
  function activateEncoder(format){
    if (encodeComponent == false){
      if (format == "encode"){
        encoderInput.value = encodeURI(encoderInput.value);
      }
      if (format == "decode"){
        encoderInput.value = decodeURI(encoderInput.value);
      }
    }
    if (encodeComponent == true){
      if (format == "encode"){
        encoderInput.value = encodeURIComponent(encoderInput.value);
      }
      if (format == "decode"){
        encoderInput.value = decodeURIComponent(encoderInput.value);
      }
    }
  }
  function insertTemplate(){
    userInput.value = decodeURI("%3C!DOCTYPE%20html%3E%0A%3Chtml%3E%0A%0A%3Chead%3E%0A%0A%3Ctitle%3E%3C/title%3E%0A%3Cmeta%20charset=%22UTF-8%22%3E%0A%3Cmeta%20name=%22viewport%22%20content=%22width=device-width,%20initial-scale=1%22%3E%0A%0A%3Cstyle%3E%0A%20%20*,%20*::before,%20*::after%20%7B%0A%20%20%20%20margin:%200;%0A%20%20%20%20padding:%200;%0A%20%20%20%20box-sizing:%20border-box;%0A%20%20%20%20font-family:%20sans-serif;%0A%20%20%7D%0A%20%20body%20%7B%0A%20%20%20%20width:%20100vw;%0A%20%20%20%20height:%20100vh;%0A%20%20%7D%0A%3C/style%3E%0A%0A%3C/head%3E%0A%0A%3Cbody%3E%0A%0A%3Cscript%3E%0A%3C/script%3E%0A%0A%3C/body%3E%0A%0A%3C/html%3E");
    sourceChange = true;
    changeView("split");
  }
  function forceRefresh(){
    var store = refresh;
    refresh = "true";
    sourceChange = true;
    previewRefresh();
    refresh = store;
  }
  function previewRefresh(){
    if (refresh == "true" && sourceChange){
      preview.src = "about:blank";
      preview.contentWindow.document.open();
      preview.contentWindow.document.write(userInput.value);
      preview.contentWindow.document.close();
      sourceChange = false;
    }
  }
  function toggleScaling(){
    header.classList.toggle("resize");
    main.classList.toggle("resize");
    userInput.classList.toggle("resize");
    scaler.classList.toggle("active");
    preview.classList.toggle("resize");
  }
  function setScaling(event){
    var cursorOffset, windowAxis;
    if (orientation == "horizontal"){
      cursorOffset = event.clientY - header.offsetHeight;
      windowAxis = window.innerHeight;
    }
    if (orientation == "vertical"){
      cursorOffset = event.clientX;
      windowAxis = window.innerWidth;
    }
    if (cursorOffset <= 80){
      cursorOffset = 80;
    }
    if (orientation == "horizontal"){
      if (cursorOffset >= windowAxis - 80 - header.offsetHeight){
        cursorOffset = windowAxis - 80 - header.offsetHeight;
      }
    }
    if (orientation == "vertical"){
      if (cursorOffset >= windowAxis - 80){
        cursorOffset = windowAxis - 80;
      }
    }
    if (orientation == "horizontal"){
      userInput.style.height = `calc(${cursorOffset}px - 8px)`;
      scaler.style.bottom = `calc(100% - ${cursorOffset}px - 8px)`;
      preview.style.height = `calc(100% - ${cursorOffset}px - 8px)`;
    }
    if (orientation == "vertical"){
      header.style.boxShadow = `calc(-100vw + ${cursorOffset}px) 1px 8px var(--box-shadow-color)`;
      userInput.style.width = `calc(${cursorOffset}px - 8px)`;
      scaler.style.right = `calc(100% - ${cursorOffset}px - 8px)`;
      preview.style.width = `calc(100% - ${cursorOffset}px - 8px)`;
    }
  }
  function removeScaling(type){
    document.body.removeEventListener("mousemove",setScaling);
    document.body.removeEventListener("mouseup",removeScaling);
    document.body.removeEventListener("mouseleave",removeScaling);
    toggleScaling();
  }