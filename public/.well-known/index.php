<?php
http_response_code(401);
exit;
// Specify the content type as JSON
header('Content-Type: application/json');

// Prevent caching of the file
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

// Output the JSON content for the apple-app-site-association
echo json_encode(array(
    "applinks" => array(
        "apps" => array(),
        "details" => array(
            array(
                "appID" => "5Q877873WD.me.onvo.ONVO",
                "paths" => array("*")
            )
        )
    )
), JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);

?>