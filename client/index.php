<!--
  --	Graphene Index Page w0.4.2
  --	Written by Trewbot
  --	Oct 17, 2015
  -->

<? require('/scripts/dev.php'); ?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<link rel="stylesheet"	href="/assets/style.css" type="text/css" id="basecss">
	<link rel="stylesheet"	href="/assets/style.php?<?=$dev?'dev':'gra'?>" type="text/css"  id="phpcss">
	<link rel="stylesheet"	href="/assets/prism.css" type="text/css" id="prismcss">
	<link rel="icon"		href="/assets/img/fav.png">
	
	<?	$files = array_diff(scandir('temps'), array('..','.'));
		foreach($files as $file): ?>
		<script id="<?=explode('.',$file)[0]?>-template" type="text/x-handlebars-template">
			<? readfile('temps/'.$file); ?>
		</script>
	<?	endforeach; ?>
	
	<script>
		<? if($dev): ?>
			var url		= "http://dev.phene.co",
				api		= "http://dev.phene.co:3000",
				name	= "Devphene";
		<? else: ?>
			var url		= "http://gra.phene.co",
				api		= "http://gra.phene.co:3200",
				name	= "Graphene";
		<? endif;?>
	</script>
	
	<script src="https://cdn.rawgit.com/visionmedia/page.js/master/page.js"></script>
	<script src="http://connect.soundcloud.com/sdk.js"></script>
	
	<script src="/scripts/prism.js"			type="text/javascript"></script>
	<script src="/scripts/handlebars.js"	type="text/javascript"></script>
	<script src="/scripts/swfobject.js"		type="text/javascript"></script>
	<script src="/scripts/app.js"			type="text/javascript"></script>
	
	<script src="//scripts.phene.co/color/0.1.0.0006"></script>
	<script src="//scripts.phene.co/crop/0.0.2.0017"></script>
	<script src="//scripts.phene.co/popup/0.1.0.0012"></script>
	<script src="//scripts.phene.co/menu/0.4.3.0031.min"></script>
	
	<script>
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
		ga('create', 'UA-67481186-6', 'auto');
		ga('send', 'pageview');
	</script>
	
	<title><?=$dev?'Devphene':'Graphene'?></title>
</head>
<body style="overflow:hidden;">
	<div id="loading">
		<div id="loading-icon" style="opacity:1;">
		<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 500 500" enable-background="new 0 0 500 500" xml:space="preserve">
			<g>
				<? if($dev): ?>
					<polygon fill="none" stroke="#FFFFFF" stroke-width="15" points="410.8,393 87.9,393 249.3,113.3"/>
				<? else: ?>
					<polygon fill="none" stroke="#FFFFFF" stroke-width="15" points="410.8,342 249.3,435.2 87.9,342 87.9,155.5 249.3,62.3 410.8,155.5"/>
				<? endif;?>
			</g>
		</svg>
		</div>
		<div id="loading-container">
			<div id="loading-bar"></div>
		</div>
		<div id="loading-error"></div>
		<a href="http://phene.co"><div id="brand" style="color:white !important;font-family:serif;">
			phene.co
		</div></a>
	</div>
	<div id="side">
	<div id="side-bar">
		<div id="side-head">
			<div id="side-logo" onclick="Graphene.theme.menu()"></div>
			<div id="side-notes" style="display:none;">0</div>
			<audio id="notification_sound" src="/assets/aud/note.mp3" preload="auto"></audio>
		</div>
		<div id="side-content"></div>
		<div id="side-loading"></div>
		<div id="side-version"></div>
	</div>
	</div>
	<div id="body"></div>
</body>
</html>