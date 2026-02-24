<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();

            // Core
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // Listing classification
            $table->enum('listing_type', ['rent', 'sale']);
            $table->enum('property_type', [
                'house', 'apartment', 'flat', 'studio',
                'bungalow', 'duplex', 'terraced', 'semi-detached', 'detached',
            ]);
            $table->enum('status', ['active', 'inactive', 'sold', 'let'])->default('active');

            // Pricing
            $table->decimal('price', 10, 2);
            $table->enum('price_period', ['per_month', 'per_week', 'per_year'])->nullable();

            // Property details
            $table->unsignedTinyInteger('bedrooms');
            $table->unsignedTinyInteger('bathrooms');
            $table->unsignedInteger('area_sqft')->nullable();

            // Location
            $table->string('address');
            $table->string('town');
            $table->string('county');
            $table->string('eircode')->nullable();

            // Media & features
            $table->json('images')->nullable();
            $table->json('features')->nullable();

            // Flags
            $table->boolean('is_featured')->default(false);
            $table->date('available_from')->nullable();

            $table->timestamps();

            // Indexes for filtering
            $table->index('listing_type');
            $table->index('property_type');
            $table->index('county');
            $table->index('status');
            $table->index('price');
            $table->index('bedrooms');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
