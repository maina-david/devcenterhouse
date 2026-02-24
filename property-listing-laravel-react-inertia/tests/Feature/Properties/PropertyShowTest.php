<?php

namespace Tests\Feature\Properties;

use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PropertyShowTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Access
    // -------------------------------------------------------------------------

    public function test_guest_can_access_property_detail_page(): void
    {
        $property = Property::factory()->create();

        $response = $this->get("/properties/{$property->id}/{$property->slug}");

        $response->assertOk();
    }

    public function test_url_works_without_slug_segment(): void
    {
        $property = Property::factory()->create();

        $response = $this->get("/properties/{$property->id}");

        $response->assertOk();
    }

    public function test_returns_correct_inertia_component(): void
    {
        $property = Property::factory()->create();

        $response = $this->get("/properties/{$property->id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->component('properties/show')
        );
    }

    // -------------------------------------------------------------------------
    // Props
    // -------------------------------------------------------------------------

    public function test_returns_property_prop_with_correct_id(): void
    {
        $property = Property::factory()->create();

        $response = $this->get("/properties/{$property->id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->component('properties/show')
            ->has('property')
            ->where('property.id', $property->id)
        );
    }

    public function test_returns_property_title_and_key_fields(): void
    {
        $property = Property::factory()->create([
            'title' => 'Stunning 3-Bed House in Dublin',
            'county' => 'Dublin',
        ]);

        $response = $this->get("/properties/{$property->id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->where('property.title', 'Stunning 3-Bed House in Dublin')
            ->where('property.county', 'Dublin')
        );
    }

    public function test_returns_related_prop(): void
    {
        $property = Property::factory()->inCounty('Dublin')->create();

        $response = $this->get("/properties/{$property->id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->has('related')
        );
    }

    public function test_related_properties_share_county_or_property_type(): void
    {
        $property = Property::factory()->inCounty('Dublin')->ofType('apartment')->create();

        // Same county
        $sameCounty = Property::factory()->inCounty('Dublin')->ofType('house')->count(2)->create();
        // Same type, different county
        $sameType = Property::factory()->inCounty('Cork')->ofType('apartment')->create();
        // Unrelated
        Property::factory()->inCounty('Galway')->ofType('studio')->create();

        $response = $this->get("/properties/{$property->id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->has('related', 3)
        );
    }

    public function test_related_does_not_include_the_viewed_property(): void
    {
        $property = Property::factory()->inCounty('Dublin')->create();
        Property::factory()->inCounty('Dublin')->count(2)->create();

        $response = $this->get("/properties/{$property->id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->where('related', fn ($related) => collect($related)->every(fn ($r) => $r['id'] !== $property->id)
            )
        );
    }

    public function test_related_is_capped_at_three(): void
    {
        $property = Property::factory()->inCounty('Dublin')->create();
        Property::factory()->inCounty('Dublin')->count(10)->create();

        $response = $this->get("/properties/{$property->id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->has('related', 3)
        );
    }

    // -------------------------------------------------------------------------
    // 404 / inactive
    // -------------------------------------------------------------------------

    public function test_returns_404_for_non_existent_property(): void
    {
        $response = $this->get('/properties/99999');

        $response->assertNotFound();
    }

    public function test_returns_404_for_inactive_property(): void
    {
        $property = Property::factory()->inactive()->create();

        $response = $this->get("/properties/{$property->id}");

        $response->assertNotFound();
    }

    public function test_returns_404_for_sold_property(): void
    {
        $property = Property::factory()->sold()->create();

        $response = $this->get("/properties/{$property->id}");

        $response->assertNotFound();
    }

    public function test_returns_404_for_let_property(): void
    {
        $property = Property::factory()->let()->create();

        $response = $this->get("/properties/{$property->id}");

        $response->assertNotFound();
    }
}
