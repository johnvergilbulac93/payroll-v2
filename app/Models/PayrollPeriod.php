<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['Year', 'Month', 'CutoffNumber', 'PeriodStart', 'PeriodEnd', 'CutoffDateID', 'PayDate', 'Status'])]
class PayrollPeriod extends Model
{
    protected $casts = [
        'PeriodStart' => 'date',
        'PeriodEnd' => 'date',
        'PayDate' => 'date',
        'Year' => 'integer',
        'Month' => 'integer',
    ];
    public function dtrRecords(): HasMany
    {
        return $this->hasMany(DtrRecord::class, 'PayrollPeriodID');
    }
    public function cutoffDates(): BelongsTo
    {
        return $this->belongsTo(CutOffDate::class, 'CutoffDateID');
    }

    public static function forDate(string $date, CutOffDate $cutoffDate): self
    {
        $date = Carbon::parse($date);
        $day = $date->day;

        // Cutoff 2 — assumed to always stay inside the same calendar month.
        if ($day >= $cutoffDate->Cutoff2StartDay && $day <= $cutoffDate->Cutoff2EndDay) {
            return self::firstOrCreate(
                [
                    'Year' => $date->year,
                    'Month' => $date->month,
                    'CutoffNumber' => 2,
                    'CutoffDateID' => $cutoffDate->id,
                ],
                [
                    'PeriodStart' => $date->copy()->day($cutoffDate->Cutoff2StartDay),
                    'PeriodEnd' => $date->copy()->day($cutoffDate->Cutoff2EndDay),
                    'PayDate' => $date->copy()->endOfMonth(),
                    'Status' => 'open',
                ]
            );
        }

        // Cutoff 1 — may wrap across month-end, so figure out which month
        // "owns" this period (the month containing the 1st–Cutoff1EndDay side).
        $owningMonth = $day >= $cutoffDate->Cutoff1StartDay
            ? $date->copy()->addMonthNoOverflow()
            : $date->copy();

        return self::firstOrCreate(
            [
                'Year' => $owningMonth->year,
                'Month' => $owningMonth->month,
                'CutoffNumber' => 1,
                'CutoffDateID' => $cutoffDate->id,
            ],
            [
                'PeriodStart' => $owningMonth->copy()->subMonthNoOverflow()->day($cutoffDate->Cutoff1StartDay),
                'PeriodEnd' => $owningMonth->copy()->day($cutoffDate->Cutoff1EndDay),
                'PayDate' => $owningMonth->copy()->day(15),
                'Status' => 'open',
            ]
        );
    }

    /**
     * Generate all 24 periods (2 per month) for a given year, under a given scheme.
     */
    public static function generateForYear(int $year, CutOffDate $cutoffDate): void
    {
        for ($month = 1; $month <= 12; $month++) {
            self::forDate(Carbon::create($year, $month, 1)->toDateString(), $cutoffDate);
            self::forDate(Carbon::create($year, $month, 16)->toDateString(), $cutoffDate);
        }
    }
    public function scopeFilter(Builder $query, array $filters)
    {
        $query->when($filters['status'] ?? null, function ($query, $status) {
            $query->where('Status', $status);
        });
        $query->when($filters['year'] ?? null, function ($query, $year) {
            $query->where('Year', $year);
        });
        $query->when($filters['month'] ?? null, function ($query, $month) {
            $query->where('Month', $month);
        });

        return $query;
    }
}
