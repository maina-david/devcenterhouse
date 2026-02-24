<?php

namespace Tests\Unit;

use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyModelTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // scopeActive
    // -------------------------------------------------------------------------

    public function test_scope_active_returns_active_properties(): void
    {
        Property::factory()->count(3)->create(['status' => 'active']);

        $this->assertCount(3, Property::active()->get());
    }

    public function test_scope_active_excludes_inactive_properties(): void
    {
        Property::factory()->create(['status' => 'active']);
        Property::factory()->inactive()->create();

        $this->assertCount(1, Property::active()->get());
    }

    public function test_scope_active_excludes_sold_properties(): void
    {
        Property::factory()->create(['status' => 'active']);
        Property::factory()->sold()->create();

        $this->assertCount(1, Property::active()->get());
    }

    public function test_scope_active_excludes_let_properties(): void
    {
        Property::factory()->create(['status' => 'active']);
        Property::factory()->let()->create();

        $this->assertCount(1, Property::active()->get());
    }

    // -------------------------------------------------------------------------
    // scopeFilter — search
    // -------------------------------------------------------------------------

    public function test_filter_scope_searches_by_title(): void
    {
        Property::factory()->create(['title' => 'Lovely Cottage in the Hills', 'status' => 'active']);
        Property::factory()->create(['title' => 'City Centre Studio', 'status' => 'active']);

        $results = Property::active()->filter(['search' => 'Cottage'])->get();

        $this->assertCount(1, $results);
        $this->assertStringContainsString('Cottage', $results->first()->title);
    }

    public function test_filter_scope_searches_by_county(): void
    {
        Property::factory()->create(['county' => 'Dublin', 'status' => 'active']);
        Property::factory()->create(['county' => 'Cork', 'status' => 'active']);

        $results = Property::active()->filter(['search' => 'Dublin'])->get();

        $this->assertCount(1, $results);
        $this->assertEquals('Dublin', $results->first()->county);
    }

    public function test_filter_scope_searches_by_town(): void
    {
        Property::factory()->create(['town' => 'Blackrock', 'county' => 'Dublin', 'status' => 'active']);
        Property::factory()->create(['town' => 'Salthill', 'county' => 'Galway', 'status' => 'active']);

        $results = Property::active()->filter(['search' => 'Blackrock'])->get();

        $this->assertCount(1, $results);
        $this->assertEquals('Blackrock', $results->first()->town);
    }

    public function test_filter_scope_searches_by_address(): void
    {
        Property::factory()->create(['address' => '12 Oak Street', 'status' => 'active']);
        Property::factory()->create(['address' => '5 Elm Avenue', 'status' => 'active']);

        $results = Property::active()->filter(['search' => 'Oak Street'])->get();

        $this->assertCount(1, $results);
        $this->assertStringContainsString('Oak', $results->first()->address);
    }

    public function test_filter_scope_returns_all_when_search_is_empty(): void
    {
        Property::factory()->count(4)->create(['status' => 'active']);

        $results = Property::active()->filter(['search' => ''])->get();

        $this->assertCount(4, $results);
    }

    // -------------------------------------------------------------------------
    // scopeFilter — individual filters
    // -------------------------------------------------------------------------

    public function test_filter_scope_filters_by_listing_type_rent(): void
    {
        Property::factory()->forRent()->count(2)->create();
        Property::factory()->forSale()->count(3)->create();

        $results = Property::active()->filter(['listing_type' => 'rent'])->get();

        $this->assertCount(2, $results);
        $results->each(fn ($p) => $this->assertEquals('rent', $p->listing_type));
    }

    public function test_filter_scope_filters_by_listing_type_sale(): void
    {
        Property::factory()->forRent()->count(2)->create();
        Property::factory()->forSale()->count(3)->create();

        $results = Property::active()->filter(['listing_type' => 'sale'])->get();

        $this->assertCount(3, $results);
        $results->each(fn ($p) => $this->assertEquals('sale', $p->listing_type));
    }

    public function test_filter_scope_filters_by_property_type(): void
    {
        Property::factory()->ofType('apartment')->count(3)->create();
        Property::factory()->ofType('house')->count(2)->create();

        $results = Property::active()->filter(['property_type' => 'apartment'])->get();

        $this->assertCount(3, $results);
        $results->each(fn ($p) => $this->assertEquals('apartment', $p->property_type));
    }

    public function test_filter_scope_filters_by_county(): void
    {
        Property::factory()->inCounty('Dublin')->count(4)->create();
        Property::factory()->inCounty('Cork')->count(2)->create();

        $results = Property::active()->filter(['county' => 'Dublin'])->get();

        $this->assertCount(4, $results);
        $results->each(fn ($p) => $this->assertEquals('Dublin', $p->county));
    }

    public function test_filter_scope_filters_by_min_price(): void
    {
        Property::factory()->create(['price' => 500, 'status' => 'active']);
        Property::factory()->create(['price' => 1500, 'status' => 'active']);
        Property::factory()->create(['price' => 3000, 'status' => 'active']);

        $results = Property::active()->filter(['min_price' => '1000'])->get();

        $this->assertCount(2, $results);
        $results->each(fn ($p) => $this->assertGreaterThanOrEqual(1000, $p->price));
    }

    public function test_filter_scope_filters_by_max_price(): void
    {
        Property::factory()->create(['price' => 500, 'status' => 'active']);
        Property::factory()->create(['price' => 1500, 'status' => 'active']);
        Property::factory()->create(['price' => 3000, 'status' => 'active']);

        $results = Property::active()->filter(['max_price' => '2000'])->get();

        $this->assertCount(2, $results);
        $results->each(fn ($p) => $this->assertLessThanOrEqual(2000, $p->price));
    }

    public function test_filter_scope_filters_by_min_bedrooms(): void
    {
        Property::factory()->create(['bedrooms' => 1, 'status' => 'active']);
        Property::factory()->create(['bedrooms' => 3, 'status' => 'active']);
        Property::factory()->create(['bedrooms' => 5, 'status' => 'active']);

        $results = Property::active()->filter(['bedrooms' => '3'])->get();

        $this->assertCount(2, $results);
        $results->each(fn ($p) => $this->assertGreaterThanOrEqual(3, $p->bedrooms));
    }

    // -------------------------------------------------------------------------
    // scopeFilter — sorting
    // -------------------------------------------------------------------------

    public function test_filter_scope_sorts_by_price_asc(): void
    {
        Property::factory()->create(['price' => 300000, 'status' => 'active']);
        Property::factory()->create(['price' => 100000, 'status' => 'active']);
        Property::factory()->create(['price' => 200000, 'status' => 'active']);

        $prices = Property::active()->filter(['sort' => 'price_asc'])->pluck('price')->map(fn ($p) => (float) $p)->toArray();

        $this->assertEquals([100000, 200000, 300000], $prices);
    }

    public function test_filter_scope_sorts_by_price_desc(): void
    {
        Property::factory()->create(['price' => 300000, 'status' => 'active']);
        Property::factory()->create(['price' => 100000, 'status' => 'active']);
        Property::factory()->create(['price' => 200000, 'status' => 'active']);

        $prices = Property::active()->filter(['sort' => 'price_desc'])->pluck('price')->map(fn ($p) => (float) $p)->toArray();

        $this->assertEquals([300000, 200000, 100000], $prices);
    }

    public function test_filter_scope_sorts_by_oldest(): void
    {
        $first = Property::factory()->create(['status' => 'active', 'created_at' => now()->subDays(3)]);
        $second = Property::factory()->create(['status' => 'active', 'created_at' => now()->subDays(1)]);
        $third = Property::factory()->create(['status' => 'active', 'created_at' => now()]);

        $ids = Property::active()->filter(['sort' => 'oldest'])->pluck('id')->toArray();

        $this->assertEquals([$first->id, $second->id, $third->id], $ids);
    }

    public function test_filter_scope_defaults_to_newest(): void
    {
        $oldest = Property::factory()->create(['status' => 'active', 'created_at' => now()->subDays(5)]);
        $newest = Property::factory()->create(['status' => 'active', 'created_at' => now()]);
        $middle = Property::factory()->create(['status' => 'active', 'created_at' => now()->subDays(2)]);

        $ids = Property::active()->filter([])->pluck('id')->toArray();

        $this->assertEquals([$newest->id, $middle->id, $oldest->id], $ids);
    }

    // -------------------------------------------------------------------------
    // Accessors and casts
    // -------------------------------------------------------------------------

    public function test_get_main_image_attribute_returns_first_image(): void
    {
        $property = Property::factory()->create([
            'images' => ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
            'status' => 'active',
        ]);

        $this->assertEquals('https://example.com/img1.jpg', $property->main_image);
    }

    public function test_get_main_image_attribute_returns_null_when_images_empty(): void
    {
        $property = Property::factory()->create(['images' => [], 'status' => 'active']);

        $this->assertNull($property->main_image);
    }

    public function test_images_are_cast_to_array(): void
    {
        $property = Property::factory()->create([
            'images' => ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
            'status' => 'active',
        ]);

        $this->assertIsArray($property->fresh()->images);
        $this->assertCount(2, $property->fresh()->images);
    }

    public function test_features_are_cast_to_array(): void
    {
        $property = Property::factory()->create([
            'features' => ['parking', 'garden', 'balcony'],
            'status' => 'active',
        ]);

        $this->assertIsArray($property->fresh()->features);
        $this->assertContains('parking', $property->fresh()->features);
    }

    public function test_is_featured_is_cast_to_boolean(): void
    {
        $featured = Property::factory()->featured()->create();
        $regular = Property::factory()->create(['is_featured' => false]);

        $this->assertTrue($featured->fresh()->is_featured);
        $this->assertFalse($regular->fresh()->is_featured);
    }

    public function test_price_is_cast_to_decimal(): void
    {
        $property = Property::factory()->create(['price' => 1500.50, 'status' => 'active']);

        $this->assertEquals('1500.50', $property->fresh()->price);
    }
}
