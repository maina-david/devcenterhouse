<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $propertyId = $this->route('property') instanceof \App\Models\Property
            ? $this->route('property')->id
            : $this->route('property');

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', "unique:properties,slug,{$propertyId}"],
            'description' => ['nullable', 'string'],
            'listing_type' => ['required', 'in:rent,sale'],
            'property_type' => ['required', 'in:house,apartment,flat,studio,bungalow,duplex,terraced,semi-detached,detached'],
            'status' => ['required', 'in:active,inactive,sold,let'],
            'price' => ['required', 'numeric', 'min:0'],
            'price_period' => ['nullable', 'in:per_month,per_week,per_year'],
            'bedrooms' => ['required', 'integer', 'min:0', 'max:20'],
            'bathrooms' => ['required', 'integer', 'min:0', 'max:20'],
            'area_sqft' => ['nullable', 'integer', 'min:0'],
            'address' => ['required', 'string', 'max:255'],
            'town' => ['required', 'string', 'max:100'],
            'county' => ['required', 'string', 'max:100'],
            'eircode' => ['nullable', 'string', 'max:10'],
            'images' => ['required', 'array', 'min:1'],
            'images.*' => ['required', 'url'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:100'],
            'is_featured' => ['boolean'],
            'available_from' => ['nullable', 'date'],
        ];
    }
}
