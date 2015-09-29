var express = require('express');
var app = express();

app.use(require('serve-static')(__dirname));

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function(){
    console.log('App listening on port ' + app.get('port'));
});