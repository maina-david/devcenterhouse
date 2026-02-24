<?php

namespace Tests\Feature\Properties;

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PropertyCrudTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create();
    }

    // -------------------------------------------------------------------------
    // Admin index
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_access_admin_index(): void
    {
        $this->get('/admin/properties')->assertRedirect('/login');
    }

    public function test_authenticated_user_can_access_admin_index(): void
    {
        Property::factory()->count(3)->create();

        $this->actingAs($this->admin())
            ->get('/admin/properties')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('properties/admin-index'));
    }

    public function test_admin_index_returns_all_statuses(): void
    {
        Property::factory()->create(['status' => 'active']);
        Property::factory()->inactive()->create();
        Property::factory()->sold()->create();

        $this->actingAs($this->admin())
            ->get('/admin/properties')
            ->assertInertia(fn (Assert $page) => $page
                ->has('properties.data', 3)
            );
    }

    // -------------------------------------------------------------------------
    // Create form
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_access_create_form(): void
    {
        $this->get('/admin/properties/create')->assertRedirect('/login');
    }

    public function test_authenticated_user_can_access_create_form(): void
    {
        $this->actingAs($this->admin())
            ->get('/admin/properties/create')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('properties/create'));
    }

    // -------------------------------------------------------------------------
    // Store
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_create_property(): void
    {
        $this->post('/admin/properties', [])->assertRedirect('/login');
    }

    public function test_authenticated_user_can_create_property(): void
    {
        $payload = $this->validPropertyPayload();

        $this->actingAs($this->admin())
            ->post('/admin/properties', $payload)
            ->assertRedirect();

        $this->assertDatabaseHas('properties', ['title' => $payload['title']]);
    }

    public function test_create_requires_title(): void
    {
        $payload = array_merge($this->validPropertyPayload(), ['title' => '']);

        $this->actingAs($this->admin())
            ->post('/admin/properties', $payload)
            ->assertSessionHasErrors('title');
    }

    public function test_create_requires_valid_listing_type(): void
    {
        $payload = array_merge($this->validPropertyPayload(), ['listing_type' => 'invalid']);

        $this->actingAs($this->admin())
            ->post('/admin/properties', $payload)
            ->assertSessionHasErrors('listing_type');
    }

    public function test_create_requires_at_least_one_image(): void
    {
        $payload = array_merge($this->validPropertyPayload(), ['images' => []]);

        $this->actingAs($this->admin())
            ->post('/admin/properties', $payload)
            ->assertSessionHasErrors('images');
    }

    public function test_create_requires_images_to_be_urls(): void
    {
        $payload = array_merge($this->validPropertyPayload(), ['images' => ['not-a-url']]);

        $this->actingAs($this->admin())
            ->post('/admin/properties', $payload)
            ->assertSessionHasErrors('images.0');
    }

    public function test_slug_is_unique(): void
    {
        Property::factory()->create(['slug' => 'my-property']);
        $payload = array_merge($this->validPropertyPayload(), ['slug' => 'my-property']);

        $this->actingAs($this->admin())
            ->post('/admin/properties', $payload)
            ->assertSessionHasErrors('slug');
    }

    // -------------------------------------------------------------------------
    // Edit form
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_access_edit_form(): void
    {
        $property = Property::factory()->create();

        $this->get("/admin/properties/{$property->id}/edit")->assertRedirect('/login');
    }

    public function test_authenticated_user_can_access_edit_form(): void
    {
        $property = Property::factory()->create();

        $this->actingAs($this->admin())
            ->get("/admin/properties/{$property->id}/edit")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('properties/edit')
                ->where('property.id', $property->id)
            );
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_update_property(): void
    {
        $property = Property::factory()->create();

        $this->put("/admin/properties/{$property->id}", [])->assertRedirect('/login');
    }

    public function test_authenticated_user_can_update_property(): void
    {
        $property = Property::factory()->create(['title' => 'Old Title']);

        $payload = array_merge($this->validPropertyPayload($property->slug), ['title' => 'New Title']);

        $this->actingAs($this->admin())
            ->put("/admin/properties/{$property->id}", $payload)
            ->assertRedirect();

        $this->assertDatabaseHas('properties', ['id' => $property->id, 'title' => 'New Title']);
    }

    public function test_slug_unique_rule_ignores_own_slug_on_update(): void
    {
        $property = Property::factory()->create(['slug' => 'existing-slug']);

        $payload = array_merge($this->validPropertyPayload('existing-slug'), ['title' => 'Updated Title']);

        $this->actingAs($this->admin())
            ->put("/admin/properties/{$property->id}", $payload)
            ->assertSessionHasNoErrors();
    }

    // -------------------------------------------------------------------------
    // Destroy
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_delete_property(): void
    {
        $property = Property::factory()->create();

        $this->delete("/admin/properties/{$property->id}")->assertRedirect('/login');
    }

    public function test_authenticated_user_can_delete_property(): void
    {
        $property = Property::factory()->create();

        $this->actingAs($this->admin())
            ->delete("/admin/properties/{$property->id}")
            ->assertRedirect(route('dashboard'));

        $this->assertDatabaseMissing('properties', ['id' => $property->id]);
    }

    public function test_delete_returns_success_flash(): void
    {
        $property = Property::factory()->create();

        $this->actingAs($this->admin())
            ->delete("/admin/properties/{$property->id}")
            ->assertSessionHas('success');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function validPropertyPayload(string $slug = 'my-test-property-slug'): array
    {
        return [
            'title' => 'Test Property',
            'slug' => $slug,
            'description' => 'A great test property.',
            'listing_type' => 'rent',
            'property_type' => 'apartment',
            'status' => 'active',
            'price' => 1500,
            'price_period' => 'per_month',
            'bedrooms' => 2,
            'bathrooms' => 1,
            'area_sqft' => 750,
            'address' => '10 Test Street',
            'town' => 'Testville',
            'county' => 'Dublin',
            'eircode' => 'D01 T3ST',
            'images' => ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
            'features' => ['parking', 'garden'],
            'is_featured' => false,
            'available_from' => null,
        ];
    }
}
