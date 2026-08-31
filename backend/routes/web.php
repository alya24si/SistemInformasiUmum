<?php

use Illuminate\Support\Facades\Route;

// Arahkan root / ke halaman login frontend (React)
Route::get('/', function () {
    return redirect('http://localhost:5173');
});