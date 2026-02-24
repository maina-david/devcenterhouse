<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Property>
 */
class PropertyFactory extends Factory
{
    private static array $propertyTypes = [
        'house', 'apartment', 'flat', 'studio',
        'bungalow', 'duplex', 'terraced', 'semi-detached', 'detached',
    ];

    private static array $irishCounties = [
        'Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford',
        'Kerry', 'Kildare', 'Meath', 'Wicklow', 'Wexford',
        'Clare', 'Tipperary', 'Donegal', 'Sligo', 'Mayo',
    ];

    private static array $irishTowns = [
        'Blackrock', 'Dundrum', 'Stillorgan', 'Swords', 'Blanchardstown',
        'Dún Laoghaire', 'Tallaght', 'Santry', 'Rathmines', 'Ranelagh',
        'Ballincollig', 'Douglas', 'Bishopstown', 'Salthill', 'Oranmore',
    ];

    private static array $allFeatures = [
        'parking', 'garden', 'balcony', 'gym', 'concierge',
        'pet_friendly', 'furnished', 'dishwasher', 'washing_machine', 'dryer',
        'fireplace', 'attic', 'storage', 'alarm_system', 'solar_panels',
    ];

    public function definition(): array
    {
        $listingType = $this->faker->randomElement(['rent', 'sale']);
        $propertyType = $this->faker->randomElement(self::$propertyTypes);
        $bedrooms = $this->faker->numberBetween(1, 5);
        $title = "Modern {$bedrooms}-Bedroom ".ucfirst($propertyType);

        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.$this->faker->unique()->lexify('??????'),
            'description' => $this->faker->paragraph(3),
            'listing_type' => $listingType,
            'property_type' => $propertyType,
            'status' => 'active',
            'price' => $listingType === 'rent'
                ? $this->faker->numberBetween(800, 4000)
                : $this->faker->numberBetween(150000, 1500000),
            'price_period' => $listingType === 'rent' ? 'per_month' : null,
            'bedrooms' => $bedrooms,
            'bathrooms' => $this->faker->numberBetween(1, 3),
            'area_sqft' => $this->faker->optional(0.8)->numberBetween(400, 3000),
            'address' => $this->faker->buildingNumber().' '.$this->faker->streetName(),
            'town' => $this->faker->randomElement(self::$irishTowns),
            'county' => $this->faker->randomElement(self::$irishCounties),
            'eircode' => $this->faker->optional(0.7)->regexify('[A-Z][0-9]{2} [A-Z0-9]{4}'),
            'images' => ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
            'features' => $this->faker->randomElements(self::$allFeatures, $this->faker->numberBetween(2, 5)),
            'is_featured' => false,
            'available_from' => $listingType === 'rent'
                ? $this->faker->optional(0.5)->dateTimeBetween('now', '+3 months')
                : null,
        ];
    }

    /** State: for-rent listing */
    public function forRent(): static
    {
        return $this->state(fn () => [
            'listing_type' => 'rent',
            'price' => $this->faker->numberBetween(800, 4000),
            'price_period' => 'per_month',
        ]);
    }

    /** State: for-sale listing */
    public function forSale(): static
    {
        return $this->state(fn () => [
            'listing_type' => 'sale',
            'price' => $this->faker->numberBetween(150000, 1500000),
            'price_period' => null,
        ]);
    }

    /** State: inactive (not shown publicly) */
    public function inactive(): static
    {
        return $this->state(fn () => ['status' => 'inactive']);
    }

    /** State: sold */
    public function sold(): static
    {
        return $this->state(fn () => ['status' => 'sold']);
    }

    /** State: let */
    public function let(): static
    {
        return $this->state(fn () => ['status' => 'let']);
    }

    /** State: featured */
    public function featured(): static
    {
        return $this->state(fn () => ['is_featured' => true]);
    }

    /** State: specific county */
    public function inCounty(string $county): static
    {
        return $this->state(fn () => ['county' => $county]);
    }

    /** State: specific property type */
    public function ofType(string $type): static
    {
        return $this->state(fn () => ['property_type' => $type]);
    }
}
