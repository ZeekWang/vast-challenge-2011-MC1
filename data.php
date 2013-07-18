<?php

if(!isset($_REQUEST['action']))
{
	echo '缺少参数action';
	return;
}
$file=fopen("passwd",'r');
$username=trim(fgets($file));
$passwd=trim(fgets($file));
$database='weibo';
fclose($file);

$link=mysql_connect('localhost', $username, $passwd);
@mysql_select_db($database) or die ('无法连接数据库');
mysql_query("set names utf8");

$action=$_REQUEST['action'];

if($action=='search_word')
{
	$search_result=array();
	$query='select * from status where match(words) against("' . $_REQUEST['keyword'] . '")';
	$result=mysql_query($query) or die('查询出错');
	while($row=mysql_fetch_assoc($result))
	{
		array_push($search_result,array(
			'id'=>(int)$row['id'],
			'uid'=>(int)$row['uid'],
			'loc'=>$row['loc'],
			'lat'=>(float)$row['lat'],
			'lng'=>(float)$row['lng'],
			'text'=>$row['text'],
			'words'=>$row['words'],
			'time_string'=>$row['time_string'],
			'time'=>$row['time'],
		));
	}
	mysql_free_result($result);
	echo json_encode($search_result);
}
else if($action=='user')
{
	$search_result=array();
	$query='select * from status where uid=' . $_REQUEST['uid'];
	echo $query;
	$result=mysql_query($query) or die('查询出错');
	while($row=mysql_fetch_assoc($result))
	{
		array_push($search_result,array(
			'id'=>(int)$row['id'],
			'uid'=>(int)$row['uid'],
			'loc'=>$row['loc'],
			'lat'=>(float)$row['lat'],
			'lng'=>(float)$row['lng'],
			'text'=>$row['text'],
			'words'=>$row['words'],
			'time_string'=>$row['time_string'],
			'time'=>$row['time'],
		));
	}
	mysql_free_result($result);
	echo json_encode($search_result);
}
else if($action=='location')
{
	$search_result=array();
	$query='select * from status where lng>=' . $_REQUEST['lng_st'] . ' and lng<' . $_REQUEST['lng_ed'] . ' and lat>=' . $_REQUEST['lat_st'] . ' and lat<' . $_REQUEST['lat_ed'] . ' limit 10000';
	echo $query;
	$result=mysql_query($query) or die('查询出错');
	while($row=mysql_fetch_assoc($result))
	{
		array_push($search_result,array(
			'id'=>(int)$row['id'],
			'uid'=>(int)$row['uid'],
			'loc'=>$row['loc'],
			'lat'=>(float)$row['lat'],
			'lng'=>(float)$row['lng'],
			'text'=>$row['text'],
			'words'=>$row['words'],
			'time_string'=>$row['time_string'],
			'time'=>$row['time'],
		));
	}
	mysql_free_result($result);
	echo json_encode($search_result);
}
else
{
	echo Json::generateResult(false,'action无效');
}

mysql_close($link);
?>
