<?php

namespace App\Http\Controllers;

use App\Events\EnquiryReceived;
use App\Http\Requests\StoreEnquiryRequest;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Mail\EnquiryMailable;
use App\Models\Enquiry;
use App\Models\Property;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only([
            'search', 'listing_type', 'property_type', 'county',
            'min_price', 'max_price', 'bedrooms', 'sort',
        ]);

        $properties = Property::active()
            ->filter($filters)
            ->paginate(12)
            ->withQueryString();

        $counties = Property::active()
            ->distinct()
            ->orderBy('county')
            ->pluck('county');

        return Inertia::render('properties/index', [
            'properties' => $properties,
            'filters' => $filters,
            'counties' => $counties,
        ]);
    }

    public function show(int $id): Response
    {
        $property = Property::active()->findOrFail($id);

        $related = Property::active()
            ->where('id', '!=', $property->id)
            ->where(function ($q) use ($property) {
                $q->where('county', $property->county)
                    ->orWhere('property_type', $property->property_type);
            })
            ->take(3)
            ->get();

        return Inertia::render('properties/show', [
            'property' => $property,
            'related' => $related,
        ]);
    }

    public function enquiry(StoreEnquiryRequest $request, int $id): RedirectResponse
    {
        $property = Property::findOrFail($id);

        $enquiry = $property->enquiries()->create($request->validated());

        $enquiry->load('property');

        Mail::to(config('mail.from.address'))->queue(new EnquiryMailable($enquiry));

        broadcast(new EnquiryReceived($enquiry));

        return back()->with('success', 'Your enquiry has been sent successfully.');
    }

    public function adminIndex(): Response
    {
        $this->authorize('viewAny', Property::class);

        $properties = Property::query()
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('properties/admin-index', [
            'properties' => $properties,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Property::class);

        return Inertia::render('properties/create');
    }

    public function store(StorePropertyRequest $request): RedirectResponse
    {
        $this->authorize('create', Property::class);

        $data = $request->validated();

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $property = Property::create($data);

        return redirect()->route('properties.show', [$property->id, $property->slug])
            ->with('success', 'Property listing created successfully.');
    }

    public function edit(Property $property): Response
    {
        $this->authorize('update', $property);

        return Inertia::render('properties/edit', [
            'property' => $property,
        ]);
    }

    public function update(UpdatePropertyRequest $request, Property $property): RedirectResponse
    {
        $this->authorize('update', $property);

        $property->update($request->validated());

        return redirect()->route('properties.show', [$property->id, $property->slug])
            ->with('success', 'Property listing updated successfully.');
    }

    public function destroy(Property $property): RedirectResponse
    {
        $this->authorize('delete', $property);

        $property->delete();

        return redirect()->route('dashboard')
            ->with('success', 'Property listing deleted.');
    }

    public function enquiries(): Response
    {
        $this->authorize('viewAny', Property::class);

        $enquiries = Enquiry::with('property:id,title,slug,county')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('properties/enquiries', [
            'enquiries' => $enquiries,
        ]);
    }

    public function markEnquiryRead(Enquiry $enquiry): RedirectResponse
    {
        $this->authorize('viewAny', Property::class);

        $enquiry->update(['is_read' => true]);

        return back()->with('success', 'Enquiry marked as read.');
    }
}
