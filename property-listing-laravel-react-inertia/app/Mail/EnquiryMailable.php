<?php

namespace App\Mail;

use App\Models\Enquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EnquiryMailable extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Enquiry $enquiry) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New Enquiry: {$this->enquiry->property->title}",
            replyTo: [
                new \Illuminate\Mail\Mailables\Address(
                    $this->enquiry->email,
                    $this->enquiry->name,
                ),
            ],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.enquiry',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
