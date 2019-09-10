var paragraph = document.querySelector("#paragraph");

//set click event listener
paragraph.addEventListener("click", changeMessage);

function changeMessage() {
  paragraph.textContent = "clicked!";
  console.log(paragraph.textContent);
}
