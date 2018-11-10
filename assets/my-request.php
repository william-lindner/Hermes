<?php
if ($_SERVER["REQUEST_METHOD"] === 'GET') {
 $return             = [];
 $return['response'] = $_GET;
 $return['status']   = 500;
 echo json_encode($return);
 exit;
}

if ($_SERVER["REQUEST_METHOD"] === 'POST') {
 echo json_encode($_POST);
 exit;
}