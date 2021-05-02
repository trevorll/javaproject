

document.addEventListener('DOMContentLoaded', () => {

let themeStylesheet = "<%=theme%>"
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
// if it's light -> go dark
if(themeStylesheet ==('light1')){
	themeStylesheet = 'dark1';
	themeToggle.innerText = 'Switch to light mode';
	console.log(themeStylesheet);
	load();
} else {
	// if it's dark -> go light
	themeStylesheet = 'light1';
	console.log(themeStylesheet);
	themeToggle.innerText = 'Switch to dark mode';
	load();

}

});


const load = function () {
var chart = new CanvasJS.Chart("chartContainer", {
	theme: themeStylesheet || "light1", // "light2", "dark1", "dark2"
	animationEnabled: true, // change to true
	title:{
		text: "<%=heading%>"
	},
		// Change type to "bar", "area", "spline", "pie",etc.
	data:	[
	{
		type: "<%=type%>",
		dataPoints:[
		<% for(let j=0; j< labels.length; j++) { %>
				{label:"<%=labels[j]%>", y:<%=number[j]%>},
		<%}%>
		]
	}
]
});
chart.render();

}
load();


});