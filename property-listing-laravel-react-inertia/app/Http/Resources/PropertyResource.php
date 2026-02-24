<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'listing_type' => $this->listing_type,
            'property_type' => $this->property_type,
            'status' => $this->status,
            'price' => (float) $this->price,
            'price_period' => $this->price_period,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'area_sqft' => $this->area_sqft,
            'address' => $this->address,
            'town' => $this->town,
            'county' => $this->county,
            'eircode' => $this->eircode,
            'images' => $this->images ?? [],
            'features' => $this->features ?? [],
            'is_featured' => (bool) $this->is_featured,
            'available_from' => $this->available_from?->toDateString(),
            'main_image' => $this->main_image,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
