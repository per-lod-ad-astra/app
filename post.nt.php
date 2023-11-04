<?php 
// error_reporting(0);
// ini_set('display_error', 'off');
$postdata = file_get_contents("php://input"); 
if ($postdata) {
  //sanatize:
  $triples = preg_split("/\r\n|\n|\r/", $postdata);
  $nt = [];
  for ($i = 0; $i < count($triples); $i++) {
    @list($s, $p, $o) = explode(' ', preg_replace('/ ?\.$/', '', $triples[$i]), 3);
    if($s && $p && $o) {
      $s = preg_replace('/^\<(.+)\>$/', '$1', $s);
      $p = preg_replace('/^\<(.+)\>$/', '$1', $p);
      $o = preg_replace('/^\<(.+)\>$/', '$1', $o);
      if (
        filter_var($s, FILTER_VALIDATE_URL)
        &&
        filter_var($p, FILTER_VALIDATE_URL)
        &&
        filter_var($o, FILTER_VALIDATE_URL)
      ) {
        $nt[] = "<{$s}> <{$p}> <{$o}> .";
      } elseif (
        filter_var($s, FILTER_VALIDATE_URL)
        &&
        filter_var($p, FILTER_VALIDATE_URL)
        &&
        $p === 'https://schema.org/name'
      ) {
        $nt[] = "<{$s}> <{$p}> {$o} .";
      }
    }
  }
  if (count($nt)) {
    $file = tempnam(__DIR__ . '/relaties', '');
    $fp = fopen($file, 'w');
    fwrite($fp, implode("\n", $nt));
    fclose($fp);
    chmod($file, 0644);
    rename($file, $file . '.nt');
  }
}
