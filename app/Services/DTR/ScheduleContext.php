<?php

namespace App\Services\DTR;
use Illuminate\Support\Collection;

class ScheduleContext
{

    public function __construct(
        public Collection $schedulesByEmployee, 
        public Collection $shiftCodes,    
        public Collection $templatesByEmployee,          

    ) {}
}
