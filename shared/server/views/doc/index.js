var aglio = require('aglio');
 
// Render a blueprint with a template by name 
var blueprint = '# Some API Blueprint string';
var options = {
  themeVariables: 'default'
};
 
aglio.render(blueprint, options, function (err, html, warnings) {
    if (err) return console.log(err);
    if (warnings) console.log(warnings);
 
    console.log(html);
});
