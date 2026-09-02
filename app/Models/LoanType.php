<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $name
 */
#[Fillable(['name'])]
class LoanType extends Model {}
