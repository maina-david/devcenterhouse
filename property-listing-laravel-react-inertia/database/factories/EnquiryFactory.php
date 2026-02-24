<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Enquiry>
 */
class EnquiryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'property_id' => \App\Models\Property::factory(),
            'name' => $this->faker->name(),
            'email' => $this->faker->safeEmail(),
            'phone' => $this->faker->optional(0.7)->phoneNumber(),
            'message' => $this->faker->paragraph(),
            'is_read' => false,
        ];
    }

    public function read(): static
    {
        return $this->state(['is_read' => true]);
    }
}
