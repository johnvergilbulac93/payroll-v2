<?php

namespace App\Enums;

enum EmploymentStatus: string
{
    case Regular = 'regular';
    case Probationary = 'probationary';
    case Consultant = 'consultant';
    case Contractual = 'contractual';
}
