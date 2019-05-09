//requirements
const express = require('express');
const app     = express();
const routes  = require('./routes/routes.js')

//express set up
app.set('view engine', 'pug');
app.use(express.static('public'));

app.use(routes);
//server starter
app.listen(3000, () => {
	console.log(`server started in the port 3000`);
});