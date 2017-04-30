var express = require('express')
var app = express()
var app2 = express()
var proxy = require('express-http-proxy');
const phantom = require('phantom');
var _ph,
	_page;
phantom.create(['--ignore-ssl-errors=yes', '--load-images=no']).then(ph => {
	_ph = ph;
	return _ph.createPage();
}).then(function (page) {
	_page = page;
})

app.use('/', function(req, res, next) {
	proxy('http://core.f4map.com', {
		proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
			if (!proxyReqOpts) {
				proxyReqOpts = {}
			}
			if (!proxyReqOpts.header) {
				proxyReqOpts.header = [];
			}
			proxyReqOpts.headers['Referrer'] = 'http://demo.f4map.com/';
			return proxyReqOpts;
		},
		proxyReqPathResolver: function(req, res) {
			return require('url').parse(req.url).path;
		}
	})(req, res, next)
});
app2.get('/flightdata', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

	_page.open('https://uk.flightaware.com/live/flight/' + req.query.flightCode).then(status => {
		return _page.property('content')
	}).then(content => {
		return _page.evaluate(function() {
			return fakeMap._data;
		})
	}).then(data => {
		res.json({
			data: data
		})
	}).catch(e => console.log(e));
})

app.listen(3000, function() {
	console.log('Example app listening on port 3000!')
})
app2.listen(3001, function() {
	console.log('Example app listening on port 3001!')
})
