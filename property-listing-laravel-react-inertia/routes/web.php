<?php

use App\Http\Controllers\PropertyController;
use App\Models\Enquiry;
use App\Models\Property;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'stats' => [
            'total' => Property::active()->count(),
            'for_rent' => Property::active()->where('listing_type', 'rent')->count(),
            'for_sale' => Property::active()->where('listing_type', 'sale')->count(),
            'counties' => Property::active()->distinct('county')->count('county'),
        ],
        'featured' => Property::active()
            ->where('is_featured', true)
            ->latest()
            ->take(6)
            ->get(),
    ]);
})->name('home');

Route::get('/properties', [PropertyController::class, 'index'])->name('properties.index');
Route::get('/properties/{id}/{slug?}', [PropertyController::class, 'show'])->name('properties.show');

Route::post('/properties/{id}/enquiry', [PropertyController::class, 'enquiry'])
    ->name('properties.enquiry')
    ->middleware('throttle:5,1');

Route::get('/sitemap.xml', function () {
    $sitemap = Sitemap::create()
        ->add(Url::create('/')->setPriority(1.0)->setChangeFrequency('daily'))
        ->add(Url::create('/properties')->setPriority(0.9)->setChangeFrequency('hourly'));

    Property::active()->select('id', 'slug', 'updated_at')->each(function ($property) use ($sitemap) {
        $sitemap->add(
            Url::create("/properties/{$property->id}/{$property->slug}")
                ->setLastModificationDate($property->updated_at)
                ->setPriority(0.8)
                ->setChangeFrequency('weekly')
        );
    });

    return $sitemap->toResponse(request());
})->name('sitemap');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', function () {
        return Inertia::render('dashboard', [
            'stats' => [
                'total' => Property::active()->count(),
                'for_rent' => Property::active()->where('listing_type', 'rent')->count(),
                'for_sale' => Property::active()->where('listing_type', 'sale')->count(),
                'featured' => Property::active()->where('is_featured', true)->count(),
            ],
            'recent_properties' => Property::active()
                ->latest()
                ->take(5)
                ->get(['id', 'title', 'listing_type', 'property_type', 'price',
                    'price_period', 'county', 'bedrooms', 'created_at']),
            'recent_enquiries' => Enquiry::with('property:id,title,slug')
                ->latest()
                ->take(5)
                ->get(['id', 'property_id', 'name', 'email', 'is_read', 'created_at']),
            'unread_enquiry_count' => Enquiry::unread()->count(),
        ]);
    })->name('dashboard');

    Route::get('/admin/properties', [PropertyController::class, 'adminIndex'])->name('admin.properties.index');
    Route::get('/admin/properties/create', [PropertyController::class, 'create'])->name('admin.properties.create');
    Route::post('/admin/properties', [PropertyController::class, 'store'])->name('admin.properties.store');
    Route::get('/admin/properties/{property}/edit', [PropertyController::class, 'edit'])->name('admin.properties.edit');
    Route::put('/admin/properties/{property}', [PropertyController::class, 'update'])->name('admin.properties.update');
    Route::delete('/admin/properties/{property}', [PropertyController::class, 'destroy'])->name('admin.properties.destroy');

    Route::get('/admin/enquiries', [PropertyController::class, 'enquiries'])->name('admin.enquiries');
    Route::patch('/admin/enquiries/{enquiry}/read', [PropertyController::class, 'markEnquiryRead'])->name('admin.enquiries.read');
});

require __DIR__.'/settings.php';
