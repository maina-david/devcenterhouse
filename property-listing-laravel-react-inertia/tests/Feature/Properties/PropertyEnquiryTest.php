<?php

namespace Tests\Feature\Properties;

use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyEnquiryTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(): array
    {
        return [
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'phone' => '+353 87 123 4567',
            'message' => 'I am interested in this property. Please contact me.',
        ];
    }

    // -------------------------------------------------------------------------
    // Successful submission
    // -------------------------------------------------------------------------

    public function test_valid_enquiry_submission_redirects_back(): void
    {
        $property = Property::factory()->create();

        $response = $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", $this->validPayload());

        $response->assertRedirect();
    }

    public function test_valid_enquiry_has_success_flash_message(): void
    {
        $property = Property::factory()->create();

        $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", $this->validPayload())
            ->assertSessionHas('success', 'Your enquiry has been sent successfully.');
    }

    public function test_phone_is_optional(): void
    {
        $property = Property::factory()->create();

        $payload = $this->validPayload();
        unset($payload['phone']);

        $response = $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", $payload);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
    }

    public function test_phone_can_be_empty_string(): void
    {
        $property = Property::factory()->create();

        $payload = array_merge($this->validPayload(), ['phone' => '']);

        $response = $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", $payload);

        $response->assertSessionHasNoErrors();
    }

    // -------------------------------------------------------------------------
    // Validation — name
    // -------------------------------------------------------------------------

    public function test_name_is_required(): void
    {
        $property = Property::factory()->create();

        $payload = array_merge($this->validPayload(), ['name' => '']);

        $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", $payload)
            ->assertSessionHasErrors('name');
    }

    public function test_name_cannot_exceed_255_characters(): void
    {
        $property = Property::factory()->create();

        $payload = array_merge($this->validPayload(), ['name' => str_repeat('a', 256)]);

        $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", $payload)
            ->assertSessionHasErrors('name');
    }

    // -------------------------------------------------------------------------
    // Validation — email
    // -------------------------------------------------------------------------

    public function test_email_is_required(): void
    {
        $property = Property::factory()->create();

        $payload = array_merge($this->validPayload(), ['email' => '']);

        $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", $payload)
            ->assertSessionHasErrors('email');
    }

    public function test_email_must_be_valid_format(): void
    {
        $property = Property::factory()->create();

        $payload = array_merge($this->validPayload(), ['email' => 'not-an-email']);

        $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", $payload)
            ->assertSessionHasErrors('email');
    }

    public function test_email_cannot_exceed_255_characters(): void
    {
        $property = Property::factory()->create();

        $payload = array_merge($this->validPayload(), ['email' => str_repeat('a', 250).'@b.com']);

        $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", $payload)
            ->assertSessionHasErrors('email');
    }

    // -------------------------------------------------------------------------
    // Validation — phone
    // -------------------------------------------------------------------------

    public function test_phone_cannot_exceed_50_characters(): void
    {
        $property = Property::factory()->create();

        $payload = array_merge($this->validPayload(), ['phone' => str_repeat('1', 51)]);

        $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", $payload)
            ->assertSessionHasErrors('phone');
    }

    // -------------------------------------------------------------------------
    // Validation — message
    // -------------------------------------------------------------------------

    public function test_message_is_required(): void
    {
        $property = Property::factory()->create();

        $payload = array_merge($this->validPayload(), ['message' => '']);

        $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", $payload)
            ->assertSessionHasErrors('message');
    }

    public function test_message_cannot_exceed_2000_characters(): void
    {
        $property = Property::factory()->create();

        $payload = array_merge($this->validPayload(), ['message' => str_repeat('a', 2001)]);

        $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", $payload)
            ->assertSessionHasErrors('message');
    }

    public function test_message_of_exactly_2000_characters_is_valid(): void
    {
        $property = Property::factory()->create();

        $payload = array_merge($this->validPayload(), ['message' => str_repeat('a', 2000)]);

        $this->from("/properties/{$property->id}")
            ->post("/properties/{$property->id}/enquiry", $payload)
            ->assertSessionHasNoErrors();
    }
}
