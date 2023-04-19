//changes css. Gives width to sidenav class and changes body colour of site when navicon is pressed
function openNav() {
    document.getElementById("nav").style.width = "200px";
    document.body.style.backgroundColor = "rgba(58, 180, 160)";
  }
  //changes css. Gives width to sidenav class and changes body colour of site back when 'x' of sidenav is pressed
  function closeNav() {
    document.getElementById("nav").style.width = "0";
    document.body.style.backgroundColor = "rgb(37, 37, 37)";
  }