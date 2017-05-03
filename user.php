<?php
// Import the necessary classes
use Cartalyst\Sentinel\Native\Facades\Sentinel;
#use Cartalyst\Sentinel\Activations\EloquentActivation as Activation;
use Illuminate\Database\Capsule\Manager as Capsule;

// Include the composer autoload file
require __DIR__.'/./vendor/autoload.php';
require('./mainfile.php');

// Setup a new Eloquent Capsule instance
$capsule = new Capsule;
$capsule->addConnection([
	'driver'    => 'mysql',
	'host'      => 'localhost',
	'database'  => 'takehaya',
	'username'  => DB_USER,
	'password'  => DB_PASS,
	'charset'   => 'utf8',
	'collation' => 'utf8_unicode_ci',
]);
$capsule->bootEloquent();

$req = array();
$req['action'] = null;
if(isset($_GET['action'])){
	$_action = $_GET['action'];
	if($_action == 'signin'){
		$req['action'] = 'login';
	} elseif($_action == 'signout'){
		$req['action'] = 'logout';
	}
}

if($req['action'] == 'login'){
	$req['email'] = (isset($_POST['email'])) ? $_POST['email'] : null ;
	$req['password'] = (isset($_POST['password'])) ? $_POST['password'] : null ;
	$req['remember'] = (isset($_POST['remember']) && $_POST['remember']) ? true : false ;

	try {
		if(!Sentinel::authenticate([
			'email' => $req['email']
		,	'password' => $req['password']
		], $req['remember'])){
			$debug_output = 'Invalid email or password.';
		} else {
			$debug_output = 'You\'re signed in.';
		}
	} catch(Cartalyst\Sentinel\Checkpoints\ThrottlingException $ex){
		$debug_output = 'Too many attempts';
	} catch(Cartalyst\Sentinel\Checkpoints\NotActivatedException $ex){
/*
		$user_notactivated = Sentinel::findById(1);
		$activationRepository = new Cartalyst\Sentinel\Activations\IlluminateActivationRepository;
		$activation = $activationRepository->create($user_notactivated);
		$activation_code = $activation->code;
		if($activationRepository->complete($user_notactivated, $activation_code)){
			$debug_output = 'This activation has successed.';
		} else {
			$debug_output = 'This activation has failed.';
		}
*/
		$debug_output = 'Please activate your accout before trying to log in.';
	}
}

if($req['action'] == 'logout'){
	Sentinel::logout();
	$debug_output = 'You\'re signed out successfully.';
}

$_user = Sentinel::check();
if($_user){
	$user = array(
		'id' => $_user->id
	,	'first_name' => $_user->first_name
	,	'last_name' => $_user->last_name
	,	'email' => $_user->email
	,	'last_login' => $_user->last_login
	,	'created_at' => $_user->created_at
	,	'updated_at' => $_user->updated_at
	);
} else {
	$user = null;
}
//$debug_output = (isset($debug_output)) ? $debug_output : $_user ;

//require_once './languages/main.php';

require_once './class/template.class.php';
$template = new Template();
$template->user = $user;
$template->debug = (isset($debug_output)) ? $debug_output : '' ;
$template->show('./templates/user.html');

?>
