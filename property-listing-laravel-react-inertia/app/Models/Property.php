<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    /** @use HasFactory<\Database\Factories\PropertyFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'listing_type',
        'property_type',
        'status',
        'price',
        'price_period',
        'bedrooms',
        'bathrooms',
        'area_sqft',
        'address',
        'town',
        'county',
        'eircode',
        'images',
        'features',
        'is_featured',
        'available_from',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'images' => 'array',
        'features' => 'array',
        'is_featured' => 'boolean',
        'available_from' => 'date',
        'bedrooms' => 'integer',
        'bathrooms' => 'integer',
        'area_sqft' => 'integer',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        if (! empty($filters['search'])) {
            $search = '%'.$filters['search'].'%';
            $query->where(function (Builder $q) use ($search) {
                $q->where('title', 'like', $search)
                    ->orWhere('address', 'like', $search)
                    ->orWhere('town', 'like', $search)
                    ->orWhere('county', 'like', $search);
            });
        }

        if (! empty($filters['listing_type'])) {
            $query->where('listing_type', $filters['listing_type']);
        }

        if (! empty($filters['property_type'])) {
            $query->where('property_type', $filters['property_type']);
        }

        if (! empty($filters['county'])) {
            $query->where('county', $filters['county']);
        }

        if (! empty($filters['min_price'])) {
            $query->where('price', '>=', (float) $filters['min_price']);
        }

        if (! empty($filters['max_price'])) {
            $query->where('price', '<=', (float) $filters['max_price']);
        }

        if (! empty($filters['bedrooms'])) {
            $query->where('bedrooms', '>=', (int) $filters['bedrooms']);
        }

        $sort = $filters['sort'] ?? 'newest';
        match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'oldest' => $query->orderBy('created_at', 'asc'),
            default => $query->orderBy('created_at', 'desc'),
        };

        return $query;
    }

    public function getMainImageAttribute(): ?string
    {
        return $this->images[0] ?? null;
    }

    public function enquiries(): HasMany
    {
        return $this->hasMany(Enquiry::class);
    }
}
