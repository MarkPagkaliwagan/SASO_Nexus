<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Laravel CORS Configuration
    |--------------------------------------------------------------------------
    |
    | Allow specific origins (dev) and the storage path so html2canvas can
    | fetch images with CORS headers.
    |
    */

    // restrict the paths that will receive CORS headers
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'storage/*', // <- ensure storage files are covered
    ],

    'allowed_methods' => ['*'],

    // allow both localhost hostnames commonly used in dev
    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    // seconds
    'max_age' => 0,

    // set to true only if you actually need to send cookies / credentials cross-origin.
    // If you set this to true, make sure the frontend uses credentials and the origin is explicit.
    'supports_credentials' => false,
];
