<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Private channel for real-time admin notifications (enquiries, etc.)
// Any authenticated user can subscribe — swap for a role check in multi-tenant setup.
Broadcast::channel('admin.enquiries', function ($user) {
    return $user !== null;
});
