<?php

namespace App\Services\DTR;

use Illuminate\Support\Collection;

class ScheduleContext
{
    public function __construct(
        public Collection $templatesByEmployee,
        public Collection $shiftCodes,
        public Collection $schedules,

    ) {}
}
