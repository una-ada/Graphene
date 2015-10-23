/*
 *	Graphene
 *	Written by Trewbot
 *	Oct 13, 2015
 */

//	Set Up
var root		= __dirname,
	path		= require('path'),
	os			= require('os'),
	fs			= require('fs'),
	mongoose	= require('mongoose'),
	session		= require('express-session'),
	MongoStore	= require('connect-mongo')(session),
	bodyParser	= require('body-parser'),
	nodemailer	= require('nodemailer'),
	Handlebars	= require('handlebars'),
	entities	= new (require('html-entities').AllHtmlEntities)(),
	app			= require('express')(),
	events		= require('events'),
	config		= require('./config.json'),
	User		= require('./models/user'),
	Feed		= require('./models/feed'),
	Post		= require('./models/post'),
	Note		= require('./models/notification'),
	ServerChange = require('./models/serverchangelog'),
	Change		= require('./models/changelog'),
	EmailSrc	= fs.readFileSync('email.html', "utf8"),
	EmailTemp	= Handlebars.compile(EmailSrc),
	Graphene	= new(function(){
		this.sub			= config.sub;
		this.url			= "http://" + this.sub + ".phene.co";
		this.api			= "http://phene.co:3000";
		this.img			= "http://img.phene.co";
		this.imgDir			= config.imgDir;
		this.aud			= "http://aud.phene.co";
		this.audDir			= config.audDir;
		this.getWords		= function(string,num){
			var a;
			return entities.decode((a = string
				.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,"")
				.replace(/\n/," ")
				.split(" "))
				.splice(0,num)
				.join(" ") + (a.length > num ? "..." : ''));
		}
		this.collect		= function(){
			var ret = {},
				len = arguments.length;
			for(var i = 0; i < len; i++)
				for(p in arguments[i])
				  if(arguments[i].hasOwnProperty(p))
					ret[p] = arguments[i][p];
			return ret;
		};
		this.getUserInfo	= function(user,name,callback,req,res){
			Change.findOne({},{},{sort:{_id:-1}},function(e,c){if(e) return res.send(e);
			ServerChange.findOne({},{},{sort:{_id:-1}},function(e,sc){if(e) return res.send(e);
			User.findOne(name?{username:user.toLowerCase()}:{_id:user}, function(e,u){if(e) return res.send(e);if(u==null) return res.send(e);
			Post.find({user:u._id}, function(e,p) { if(e) return res.send(e);
			Post.find({"ratings":{$elemMatch:{field:"user",value:u._id}}}, function(e, uv){ if(e) return res.send(e);
			Graphene.getFollowing(u._id, null, function(uf){
			Graphene.getFollowing(req.session.user?req.session.user:'bypass',null,function(yf){
			User.find({_id:{$in:uf}}, function(e,fu){if(e) return res.send(e);
				var feeds = u.feeds;
				for(var i = 0; i < feeds.length; i++)
					for(var j = 0; j < feeds[i].users.length; j++){
						var id = feeds[i].users[j];
						for(var k = 0; k < fu.length; k++)
							if(""+fu[k]._id == id){
								feeds[i].users[j] = {
									_id			: id,
									userName	: fu[k].userName,
									firstName	: fu[k].firstName,
									lastName	: fu[k].lastName,
									name		: fu[k].nameHandle ? fu[k].userName : fu[k].firstName + " " + fu[k].lastName,
									avatar		: Graphene.img + "/" + fu[k].avatar + "/" + fu[k].avatarHash + "-36.jpg",
									avatarFull	: Graphene.img + "/" + fu[k].avatar + "/" + fu[k].avatarHash + "-200.jpg",
									toCrop		: Graphene.img + "/" + fu[k].avatar + "/500.jpg",
									url			: Graphene.url + "/user/" + fu[k].userName,
								}
								break;
							}
					}
				u.password = "";
				callback(JSON.stringify(Graphene.collect(u._doc,{
					user		: user,
					name		: u.nameHandle ? u.userName : u.firstName + " " + u.lastName,
					avatar		: Graphene.img + "/" + u.avatar + "/" + u.avatarHash + "-36.jpg",
					avatarFull	: Graphene.img + "/" + u.avatar + "/" + u.avatarHash + "-200.jpg",
					toCrop		: Graphene.img + "/" + u.avatar + "/500.jpg",
					url			: Graphene.url + "/user/" + u.userName,
					version		: c.version,
					sVersion	: sc.version,
					postCount	: p.length,
					upvoteCount	: uv.length,
					follows		: uf,
					joined		: u._id.getTimestamp().getTime()
				},(req.session.user
					? {following : !!~yf.indexOf(""+u._id)}
					: {following : !1}
				))));
			});
			});
			});
			});
			});
			});
			});
			});
		};
		this.getFollowing	= function(user,feed,callback){
			if(user == 'bypass') return callback([]);
			User.findOne({_id:user},function(e,u){
				if(e) return;
				if(typeof feed == 'string') {
					var feeds	= u.feeds,
						arr		= [];
					for(var i = 0; i < feeds.length; i++)
						if(feeds[i].name == feed) arr = feeds[i].users
					callback(arr);
				} else {
					var feeds	= u.feeds,
						hash	= {},
						arr		= [];
					for(var i = 0; i < feeds.length; i++)
						for(var j = 0; j < feeds[i].users.length; j++)
							if(hash[feeds[i].users[j]]!==true){
								arr[arr.length] = feeds[i].users[j];
								hash[feeds[i].users[j]] = true;
							}
					arr[arr.length] = user;
					callback(arr);
				}
			});
		};
	})(),
	mailer		= nodemailer.createTransport({
		service	: config.mailService,
		auth	: {
			user	: config.mailUser,
			pass	: config.mailPass
		}
	}),
	Notification = new events.EventEmitter();
Notification.setMaxListeners(0)
mongoose.connect('mongodb://localhost/' + Graphene.sub + 'phene');

//	Enable CORS
app.use(function(req,res,next) {
	res.header("Access-Control-Allow-Origin", "http://" + Graphene.sub + ".phene.co");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header('Access-Control-Allow-Methods', 'POST, GET, DELETE');
	next();
});

//	Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//	Sessions
app.use(session({
	secret	: config.sessionSecret,
	resave	: false,
	saveUninitialized: true,
	store	: new MongoStore({mongooseConnection: mongoose.connection}),
	cookie	: {
		maxAge	: 31536e6
	}
}));

//	Routes
app.get('/', function(req,res){res.send("Graphene Server API is running.");});
require('./controllers/changelog')(app, Graphene);
require('./controllers/users')(app, Graphene, EmailTemp, mailer);
require('./controllers/posts')(app, Graphene, Notification);
require('./controllers/notes')(app, Graphene, Notification);

//	Listen
app.listen(config.port, function(){
	mailer.sendMail({
		from	: 'support@phene.co',
		to		: 'trewbot@phene.co',
		subject	: 'Graphene Server API Running',
		text	: 'Graphene Server API Running\n\nServer Uptime: ' + ~~(os.uptime()/36e2) + 'h' + ~~((os.uptime()%36e2)/60) + 'm\nCPU: ' + os.cpus()[0].model + '\nCores: ' + os.cpus().length + ' @ ' + (~~(os.cpus()[0].speed/100)/10) + 'GHz' + '\nMemory: ' + (~~((os.totalmem()/0x40000000)*100)/100) + 'GB',
		html	: EmailTemp({
			content : 'Graphene Server API Running<br><br>Server Uptime: ' + ~~(os.uptime()/36e2) + 'h' + ~~((os.uptime()%36e2)/60) + 'm<br>CPU: ' + os.cpus()[0].model + '<br>Cores: ' + os.cpus().length + ' @ ' + (~~(os.cpus()[0].speed/100)/10) + 'GHz' + '<br>Memory: ' + (~~((os.totalmem()/0x40000000)*100)/100) + 'GB',
			prefix	: Graphene.sub
		})
	},function(e,i){
		if(e) console.log(e);
	});
	console.log("Server running.");
});