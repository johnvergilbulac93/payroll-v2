<?php

namespace App\Http\Resources\Main\Employee;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'FullName' => $this->FullName,
            'EmpNbr' => $this->EmpNbr,
            'FirstName' => $this->FirstName,
            'LastName' => $this->LastName,
            'MidName' => $this->MidName,
            'Suffix' => $this->Suffix,
            'Address' => $this->Address,
            'BirthDate' => $this->BirthDate,
            'EmployDate' => $this->EmployDate,
            'CityProv' => $this->CityProv,
            'Position' => $this->Position,
            'Assignment' => $this->Assignment,
            'SalaryGrade' => $this->SalaryGrade,
            'BasicPay' => $this->BasicPay ? $this->BasicPay : 0,
            'DailyRate' => $this->DailyRate ? $this->DailyRate : 0,
            'HourlyRate' => $this->HourlyRate ? $this->HourlyRate : 0,
            'Status' => $this->Status,
            'SSSNbr' => $this->SSSNbr,
            'PHICNbr' => $this->PHICNbr,
            'HDMFNbr' => $this->HDMFNbr,
            'TIN' => $this->TIN,
            'Degree' => $this->Degree,
            'AllowReg' => $this->AllowReg ? $this->AllowReg : 0,
            'BPIATM' => $this->BPIATM,
            'BPIEmpCode' => $this->BPIEmpCode,
            'PIN' => $this->PIN,
            'PERAAID' => $this->PERAAID,
            'Group' => $this->Group,
            'BiometricID' => trim($this->BiometricID),
            'ImageUrl' => $this->imageUrl,
            'GroupName' => $this->group?->name
            // 'Schedule' =>  EmployeeScheduleResource::collection($this->schedule),
            // 'ScheduleTemplate' =>  $this->scheduleTemplate

        ];
    }
}
