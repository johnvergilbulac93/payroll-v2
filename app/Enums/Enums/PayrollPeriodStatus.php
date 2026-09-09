<?php

namespace App\Enums\Enums;

enum PayrollPeriodStatus: string
{
    case Open = 'open';
    case Processing = 'processing';
    case Closed = 'closed';
    case Released = 'released';
}
