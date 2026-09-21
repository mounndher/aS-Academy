<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FormationController;
use App\Http\Controllers\Api\ProgrammeController;
use App\Http\Controllers\Api\FormationDayController;
use App\Http\Controllers\Api\Contenu\HeroSectionController;
use App\Http\Controllers\Api\Contenu\IntroductionSectionController;
use App\Http\Controllers\Api\Contenu\AcademySectionController;
use App\Http\Controllers\Api\Contenu\ContactSectionController;
use App\Http\Controllers\Api\Contenu\GallerySectionController;
use App\Http\Controllers\Api\ContactMessageController;

use App\Http\Controllers\Api\Contenu\TrainingExperienceController;
use App\Http\Controllers\Api\Contenu\SiteSettingController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/contact/messages', [ContactMessageController::class, 'store'])
    ->middleware('throttle:10,1');
Route::get('/formation-days', [FormationDayController::class, 'index']);

Route::get(
    '/formations/{formation}/days',
    [FormationDayController::class, 'byFormation']
);
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::get('/formations', [FormationController::class, 'index']);
Route::get('/formations/{slug}', [FormationController::class, 'show']);

Route::get('/programmes', [ProgrammeController::class, 'index']);
Route::get('/programmes/{slug}', [ProgrammeController::class, 'show']);

////
Route::prefix('contenu')->group(function () {
    Route::get('/hero', [HeroSectionController::class, 'show']);
    

    Route::get('/introduction', [
        IntroductionSectionController::class,
        'show',
    ]);
    Route::get('/academy', [
        AcademySectionController::class,
        'show',
    ]);
Route::get('gallery', [GallerySectionController::class, 'index']);
Route::get('contact', [ContactSectionController::class, 'index']);
Route::get('/training-experience',
    [TrainingExperienceController::class, 'index']
);

Route::get('/settings', [SiteSettingController::class, 'index']);

});