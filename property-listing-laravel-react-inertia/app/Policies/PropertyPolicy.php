<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;

class PropertyPolicy
{
    /**
     * Any authenticated user can manage listings (single-agent platform).
     * Swap this for role checks (e.g. $user->isAdmin()) in a multi-tenant setup.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Property $property): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Property $property): bool
    {
        return true;
    }

    public function delete(User $user, Property $property): bool
    {
        return true;
    }

    public function restore(User $user, Property $property): bool
    {
        return true;
    }

    public function forceDelete(User $user, Property $property): bool
    {
        return true;
    }
}
