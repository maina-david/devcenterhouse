<?php

namespace Tests\Feature\Properties;

use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PropertyListingTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Access
    // -------------------------------------------------------------------------

    public function test_guest_can_access_properties_listing_page(): void
    {
        $response = $this->get('/properties');

        $response->assertOk();
    }

    public function test_returns_correct_inertia_component(): void
    {
        $response = $this->get('/properties');

        $response->assertInertia(fn (Assert $page) => $page
            ->component('properties/index')
        );
    }

    // -------------------------------------------------------------------------
    // Props
    // -------------------------------------------------------------------------

    public function test_returns_properties_prop(): void
    {
        Property::factory()->count(3)->create();

        $response = $this->get('/properties');

        $response->assertInertia(fn (Assert $page) => $page
            ->component('properties/index')
            ->has('properties')
            ->has('properties.data', 3)
        );
    }

    public function test_returns_filters_prop(): void
    {
        $response = $this->get('/properties');

        $response->assertInertia(fn (Assert $page) => $page
            ->has('filters')
        );
    }

    public function test_returns_counties_prop(): void
    {
        Property::factory()->inCounty('Dublin')->create();
        Property::factory()->inCounty('Cork')->create();

        $response = $this->get('/properties');

        $response->assertInertia(fn (Assert $page) => $page
            ->has('counties')
        );
    }

    public function test_counties_contains_only_active_property_counties(): void
    {
        Property::factory()->inCounty('Dublin')->create();
        Property::factory()->inCounty('Cork')->inactive()->create();

        $response = $this->get('/properties');

        $response->assertInertia(fn (Assert $page) => $page
            ->where('counties', fn ($counties) => collect($counties)->contains('Dublin') && ! collect($counties)->contains('Cork'))
        );
    }

    // -------------------------------------------------------------------------
    // Active-only filtering
    // -------------------------------------------------------------------------

    public function test_only_active_properties_are_shown(): void
    {
        Property::factory()->count(3)->create(['status' => 'active']);
        Property::factory()->inactive()->create();
        Property::factory()->sold()->create();
        Property::factory()->let()->create();

        $response = $this->get('/properties');

        $response->assertInertia(fn (Assert $page) => $page
            ->has('properties.data', 3)
        );
    }

    // -------------------------------------------------------------------------
    // Search filter
    // -------------------------------------------------------------------------

    public function test_search_filters_by_title(): void
    {
        Property::factory()->create(['title' => 'Lovely Sea-View Apartment', 'status' => 'active']);
        Property::factory()->create(['title' => 'City Centre Studio', 'status' => 'active']);

        $response = $this->get('/properties?search=Sea-View');

        $response->assertInertia(fn (Assert $page) => $page
            ->has('properties.data', 1)
        );
    }

    public function test_search_filters_by_county(): void
    {
        Property::factory()->create(['county' => 'Galway', 'status' => 'active']);
        Property::factory()->create(['county' => 'Cork', 'status' => 'active']);

        $response = $this->get('/properties?search=Galway');

        $response->assertInertia(fn (Assert $page) => $page
            ->has('properties.data', 1)
        );
    }

    // -------------------------------------------------------------------------
    // Individual filters
    // -------------------------------------------------------------------------

    public function test_listing_type_filter_returns_rent_only(): void
    {
        Property::factory()->forRent()->count(2)->create();
        Property::factory()->forSale()->count(3)->create();

        $response = $this->get('/properties?listing_type=rent');

        $response->assertInertia(fn (Assert $page) => $page
            ->has('properties.data', 2)
        );
    }

    public function test_listing_type_filter_returns_sale_only(): void
    {
        Property::factory()->forRent()->count(2)->create();
        Property::factory()->forSale()->count(3)->create();

        $response = $this->get('/properties?listing_type=sale');

        $response->assertInertia(fn (Assert $page) => $page
            ->has('properties.data', 3)
        );
    }

    public function test_property_type_filter_works(): void
    {
        Property::factory()->ofType('apartment')->count(2)->create();
        Property::factory()->ofType('house')->count(4)->create();

        $response = $this->get('/properties?property_type=apartment');

        $response->assertInertia(fn (Assert $page) => $page
            ->has('properties.data', 2)
        );
    }

    public function test_county_filter_works(): void
    {
        Property::factory()->inCounty('Dublin')->count(3)->create();
        Property::factory()->inCounty('Kerry')->count(2)->create();

        $response = $this->get('/properties?county=Dublin');

        $response->assertInertia(fn (Assert $page) => $page
            ->has('properties.data', 3)
        );
    }

    public function test_min_price_filter_works(): void
    {
        Property::factory()->create(['price' => 500, 'status' => 'active']);
        Property::factory()->create(['price' => 1500, 'status' => 'active']);
        Property::factory()->create(['price' => 3000, 'status' => 'active']);

        $response = $this->get('/properties?min_price=1000');

        $response->assertInertia(fn (Assert $page) => $page
            ->has('properties.data', 2)
        );
    }

    public function test_max_price_filter_works(): void
    {
        Property::factory()->create(['price' => 500, 'status' => 'active']);
        Property::factory()->create(['price' => 1500, 'status' => 'active']);
        Property::factory()->create(['price' => 3000, 'status' => 'active']);

        $response = $this->get('/properties?max_price=2000');

        $response->assertInertia(fn (Assert $page) => $page
            ->has('properties.data', 2)
        );
    }

    public function test_bedrooms_filter_returns_minimum_bedrooms(): void
    {
        Property::factory()->create(['bedrooms' => 1, 'status' => 'active']);
        Property::factory()->create(['bedrooms' => 3, 'status' => 'active']);
        Property::factory()->create(['bedrooms' => 5, 'status' => 'active']);

        $response = $this->get('/properties?bedrooms=3');

        $response->assertInertia(fn (Assert $page) => $page
            ->has('properties.data', 2)
        );
    }

    // -------------------------------------------------------------------------
    // Filter values are passed back in the response
    // -------------------------------------------------------------------------

    public function test_active_filters_are_returned_in_filters_prop(): void
    {
        $response = $this->get('/properties?listing_type=rent&county=Dublin&bedrooms=2');

        $response->assertInertia(fn (Assert $page) => $page
            ->where('filters.listing_type', 'rent')
            ->where('filters.county', 'Dublin')
            ->where('filters.bedrooms', '2')
        );
    }

    // -------------------------------------------------------------------------
    // Pagination
    // -------------------------------------------------------------------------

    public function test_results_are_paginated_at_12_per_page(): void
    {
        Property::factory()->count(15)->create();

        $response = $this->get('/properties');

        $response->assertInertia(fn (Assert $page) => $page
            ->has('properties.data', 12)
            ->where('properties.total', 15)
            ->where('properties.per_page', 12)
        );
    }

    public function test_second_page_returns_remaining_results(): void
    {
        Property::factory()->count(15)->create();

        $response = $this->get('/properties?page=2');

        $response->assertInertia(fn (Assert $page) => $page
            ->has('properties.data', 3)
            ->where('properties.current_page', 2)
        );
    }
}
