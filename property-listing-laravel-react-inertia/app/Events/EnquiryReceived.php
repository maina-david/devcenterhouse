<?php

namespace App\Events;

use App\Models\Enquiry;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EnquiryReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Enquiry $enquiry) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin.enquiries'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'EnquiryReceived';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->enquiry->id,
            'name' => $this->enquiry->name,
            'email' => $this->enquiry->email,
            'property_id' => $this->enquiry->property_id,
            'property' => [
                'id' => $this->enquiry->property->id,
                'title' => $this->enquiry->property->title,
                'slug' => $this->enquiry->property->slug,
            ],
            'created_at' => $this->enquiry->created_at->toISOString(),
        ];
    }
}
