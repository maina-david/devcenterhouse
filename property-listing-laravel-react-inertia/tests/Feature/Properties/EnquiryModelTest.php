<?php

namespace Tests\Feature\Properties;

use App\Events\EnquiryReceived;
use App\Mail\EnquiryMailable;
use App\Models\Enquiry;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EnquiryModelTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Enquiry model
    // -------------------------------------------------------------------------

    public function test_enquiry_belongs_to_property(): void
    {
        $property = Property::factory()->create();
        $enquiry = Enquiry::factory()->for($property)->create();

        $this->assertTrue($enquiry->property->is($property));
    }

    public function test_property_has_many_enquiries(): void
    {
        $property = Property::factory()->create();
        Enquiry::factory()->count(3)->for($property)->create();

        $this->assertCount(3, $property->enquiries);
    }

    public function test_unread_scope_returns_only_unread(): void
    {
        $property = Property::factory()->create();
        Enquiry::factory()->for($property)->create(['is_read' => false]);
        Enquiry::factory()->for($property)->create(['is_read' => false]);
        Enquiry::factory()->for($property)->create(['is_read' => true]);

        $this->assertCount(2, Enquiry::unread()->get());
    }

    public function test_enquiry_is_cast_to_boolean_for_is_read(): void
    {
        $property = Property::factory()->create();
        $enquiry = Enquiry::factory()->for($property)->create(['is_read' => false]);

        $this->assertIsBool($enquiry->is_read);
        $this->assertFalse($enquiry->is_read);
    }

    // -------------------------------------------------------------------------
    // Enquiry submission persists to DB
    // -------------------------------------------------------------------------

    public function test_enquiry_submission_persists_to_database(): void
    {
        Mail::fake();
        Event::fake();

        $property = Property::factory()->create();

        $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'phone' => '+353 87 123 4567',
                'message' => 'I am interested in this property.',
            ]);

        $this->assertDatabaseHas('enquiries', [
            'property_id' => $property->id,
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
        ]);
    }

    public function test_enquiry_defaults_to_unread(): void
    {
        Mail::fake();
        Event::fake();

        $property = Property::factory()->create();

        $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'message' => 'Interested.',
            ]);

        $enquiry = Enquiry::where('property_id', $property->id)->first();
        $this->assertFalse($enquiry->is_read);
    }

    // -------------------------------------------------------------------------
    // Email is queued
    // -------------------------------------------------------------------------

    public function test_enquiry_submission_queues_email(): void
    {
        Mail::fake();
        Event::fake();

        $property = Property::factory()->create();

        $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'message' => 'Interested.',
            ]);

        Mail::assertQueued(EnquiryMailable::class);
    }

    // -------------------------------------------------------------------------
    // EnquiryReceived event is broadcast
    // -------------------------------------------------------------------------

    public function test_enquiry_submission_broadcasts_event(): void
    {
        Mail::fake();
        Event::fake();

        $property = Property::factory()->create();

        $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'message' => 'Interested.',
            ]);

        Event::assertDispatched(EnquiryReceived::class, function (EnquiryReceived $event) use ($property) {
            return $event->enquiry->property_id === $property->id;
        });
    }

    public function test_enquiry_received_event_broadcasts_on_correct_channel(): void
    {
        $property = Property::factory()->create();
        $enquiry = Enquiry::factory()->for($property)->create();

        $event = new EnquiryReceived($enquiry);
        $channels = $event->broadcastOn();

        $this->assertCount(1, $channels);
        $this->assertStringContainsString('admin.enquiries', $channels[0]->name);
    }

    public function test_enquiry_received_event_broadcast_payload(): void
    {
        $property = Property::factory()->create(['title' => 'Test House']);
        $enquiry = Enquiry::factory()->for($property)->create(['name' => 'Jane']);

        $event = new EnquiryReceived($enquiry);
        $payload = $event->broadcastWith();

        $this->assertEquals('Jane', $payload['name']);
        $this->assertEquals('Test House', $payload['property']['title']);
        $this->assertEquals($property->id, $payload['property_id']);
    }

    // -------------------------------------------------------------------------
    // Admin enquiry management
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_access_enquiries_admin(): void
    {
        $this->get('/admin/enquiries')->assertRedirect('/login');
    }

    public function test_authenticated_user_can_access_enquiries_admin(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/admin/enquiries')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('properties/enquiries'));
    }

    public function test_can_mark_enquiry_as_read(): void
    {
        $user = User::factory()->create();
        $property = Property::factory()->create();
        $enquiry = Enquiry::factory()->for($property)->create(['is_read' => false]);

        $this->actingAs($user)
            ->patch("/admin/enquiries/{$enquiry->id}/read")
            ->assertRedirect();

        $this->assertTrue($enquiry->fresh()->is_read);
    }

    // -------------------------------------------------------------------------
    // Rate limiting on enquiry endpoint
    // -------------------------------------------------------------------------

    public function test_enquiry_endpoint_is_rate_limited(): void
    {
        Mail::fake();
        Event::fake();

        $property = Property::factory()->create();

        $payload = [
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'message' => 'Interested.',
        ];

        // Send 5 requests — should succeed
        for ($i = 0; $i < 5; $i++) {
            $this->from("/properties/{$property->id}")
                ->post("/properties/{$property->id}/enquiry", $payload);
        }

        // 6th request should be rate limited (429)
        $response = $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", $payload);

        $response->assertStatus(429);
    }
}
