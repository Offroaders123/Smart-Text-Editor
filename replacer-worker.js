self.addEventListener("message",function(event){
  postMessage(event.data.userInput.split(event.data.locate).join(event.data.modify));
});