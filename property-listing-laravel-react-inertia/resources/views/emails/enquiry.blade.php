<x-mail.layout subject="New Enquiry – {{ $enquiry->property->title }}">
    <x-slot:header>
        <h1 class="email-header-title">New Property Enquiry</h1>
        <p class="email-header-subtitle">
            {{ $enquiry->property->title }} &mdash; {{ $enquiry->property->county }}
        </p>
    </x-slot:header>

    {{-- Enquirer details --}}
    <div class="field">
        <span class="field-label">From</span>
        <p class="field-value">{{ $enquiry->name }}</p>
    </div>

    <div class="field">
        <span class="field-label">Email</span>
        <p class="field-value">
            <a href="mailto:{{ $enquiry->email }}">{{ $enquiry->email }}</a>
        </p>
    </div>

    @if($enquiry->phone)
    <div class="field">
        <span class="field-label">Phone</span>
        <p class="field-value">
            <a href="tel:{{ $enquiry->phone }}">{{ $enquiry->phone }}</a>
        </p>
    </div>
    @endif

    <hr class="divider" />

    {{-- Property reference --}}
    <div class="field">
        <span class="field-label">Property</span>
        <p class="field-value">
            {{ $enquiry->property->title }}
            &nbsp;<span class="badge">{{ ucfirst($enquiry->property->listing_type) }}</span>
        </p>
        <p style="margin: 4px 0 0; font-size: 13px; color: #71717a;">
            &euro;{{ number_format($enquiry->property->price, 0) }}
            @if($enquiry->property->price_period)
                / {{ str_replace('per_', '', $enquiry->property->price_period) }}
            @endif
            &middot; {{ $enquiry->property->county }}
        </p>
    </div>

    <hr class="divider" />

    {{-- Message --}}
    <div class="field">
        <span class="field-label">Message</span>
        <div class="message-box">{{ $enquiry->message }}</div>
    </div>

    {{-- CTA --}}
    <div class="btn-wrapper">
        <a href="{{ url('/admin/enquiries') }}" class="btn">View in Dashboard &rarr;</a>
    </div>
</x-mail.layout>
