<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
        >
        <title>Payslip</title>

        <style>
            @page {
                margin-top: 0.5in;
                margin-right: 0.5in;
                margin-bottom: 0.5in;
                margin-left: 0.5in;
            }

            body {
                font-family: sans-serif;
                font-size: 12px;
            }

            .payslip-container {
                width: 100%;
                max-width: 400px;
                margin: 0 auto;
                border: 1px solid #000;
            }

            .page-break {
                page-break-after: always;
            }

            .payslip-container {
                width: 100%;
                max-width: 400px;
                margin: 0 auto;
                border: 1px solid #000;
            }

            .payslip-header {
                text-align: center;
                padding: 6px;
                /* border-bottom: 1px solid #000; */
            }

            .payslip-header .company-name {
                font-size: 12px;
                font-weight: bold;
                margin: 0;
            }

            .payslip-header .payslip-title {
                font-size: 11px;
                font-weight: bold;
                color: #1a4d8f;
                margin: 4px 0 0 0;
            }

            .employee-row {
                padding: 8px 10px;
                border-bottom: 1px solid #000;
                /* font-style: italic; */
                font-size: 11px;
            }

            .employee-row .value {
                /* border-bottom: 1px solid #000; */
                font-style: normal;
                font-weight: bold;
                padding-bottom: 1px;
            }

            table.payslip-table {
                width: 100%;
                border-collapse: collapse;
            }

            table.payslip-table td {
                padding: 4px 10px;
                font-size: 11px;
                border-bottom: 1px solid #ccc;
            }

            table.payslip-table td.label {
                text-align: left;
                width: 65%;
            }

            table.payslip-table td.value {
                text-align: right;
                width: 35%;
                border-left: 1px solid #000;
            }

            table.payslip-table tr.bold-row td {
                font-weight: bold;
            }

            table.payslip-table tr.section-label td {
                font-weight: bold;
                padding-top: 8px;
            }

            .payslip-footer {
                padding: 8px 10px;
                font-style: italic;
                font-size: 10px;
                border-top: 1px solid #000;
            }

            .watermark {
                position: fixed;
                top: 15%;
                left: 13%;
                width: 70%;
                opacity: 0.1;
                z-index: -1;
            }
        </style>
        <link
            rel="icon"
            href="/som-logo.ico"
            sizes="any"
        >
        <link
            rel="icon"
            href="/som-logo.svg"
            type="image/svg+xml"
        >
        <link
            rel="apple-touch-icon"
            href="/apple-touch-icon.png"
        >
    </head>

    <body>
        <img
            src="{{ public_path('logo.png') }}"
            class="watermark"
        >
        @foreach ($payslips as $index => $payslip)
            <div class="payslip-container @if (!$loop->last) page-break @endif">
                <div class="payslip-header">
                    <p class="company-name">{{ strtoupper($company) }}</p>
                    <p class="payslip-title">PAYSLIP {{ $payslip['Cutoff'] }}</p>
                </div>

                <div class="employee-row">
                    Name of Employee: <span class="value">{{ $payslip['FullName'] ?? '' }}</span>
                </div>

                <table class="payslip-table">
                    <tr class="section-label">
                        <td>SEMI-MONTHLY</td>
                        <td class="value">{{ number_format($payslip['BasicPay'], 2) }}</td>
                    </tr>
                    <tr>
                        <td class="label">Service Incentive Allowance</td>
                        <td class="value">{{ number_format($payslip['TotalAllowances'], 2) }}</td>
                    </tr>
                    <tr>
                        <td class="label">Retro adj. on SIA</td>
                        <td class="value">{{ number_format($payslip['RetroAdjSIA'], 2) }}</td>
                    </tr>
                    <tr>
                        <td class="label">Attendance Incentive</td>
                        <td class="value">{{ number_format($payslip['PerfectAttendanceIncentive'], 2) }}</td>
                    </tr>
                    <tr>
                        <td class="label">Absences/Adjustments</td>
                        <td class="value">{{ number_format($payslip['AbsenceDeduction'], 2) }}</td>
                    </tr>
                    <tr class="bold-row">
                        <td class="label">TAXABLE INCOME</td>
                        <td class="value">{{ number_format($payslip['TaxableIncome'], 2) }}</td>
                    </tr>
                    <tr class="bold-row">
                        <td class="label">GROSS PAY</td>
                        <td class="value">{{ number_format($payslip['GrossPay'], 2) }}</td>
                    </tr>
                    <tr>
                        <td class="label">Withholding Tax</td>
                        <td class="value">{{ number_format($payslip['WithholdingTax'], 2) }}</td>
                    </tr>
                    <tr>
                        <td class="label">Valuecare</td>
                        <td class="value">{{ number_format($payslip['HMOPremium'], 2) }}</td>
                    </tr>
                    <tr>
                        <td class="label">SSS Loan</td>
                        <td class="value">{{ number_format($payslip['TotalLoanDeductions'], 2) }}</td>
                    </tr>
                    <tr>
                        <td class="label">Refund of advances</td>
                        <td class="value">-</td>
                    </tr>
                    <tr>
                        <td class="label">INSET</td>
                        <td class="value">-</td>
                    </tr>
                    <tr>
                        <td class="label">PERAA Loan</td>
                        <td class="value">-</td>
                    </tr>
                    <tr>
                        <td class="label">SSS Premiums</td>
                        <td class="value">{{ number_format($payslip['SSSContribution'], 2) }}</td>
                    </tr>
                    <tr>
                        <td class="label">Medicare</td>
                        <td class="value">{{ number_format($payslip['PhilHealthContribution'], 2) }}</td>
                    </tr>
                    <tr class="bold-row">
                        <td class="label">NET PAY</td>
                        <td class="value">{{ number_format($payslip['NetPay'], 2) }}</td>
                    </tr>
                </table>

                <div class="payslip-footer">
                    Prepared by:
                </div>
            </div>
        @endforeach
    </body>

</html>
