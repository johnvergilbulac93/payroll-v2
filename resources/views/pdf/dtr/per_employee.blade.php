<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
        >
        <title>Daily Time Record</title>
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

            .title {
                text-align: center;
                margin: 0;
                padding: 1px;
                text-transform: uppercase
            }

            .watermark {
                position: fixed;
                top: 18%;
                left: 25%;
                width: 50%;
                opacity: 0.1;
                z-index: -1;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
            }

            th,
            td {
                border: 1px solid #000;
                padding: 4px 6px;
                font-size: 10px;
                text-align: center;
            }

            thead th {
                background-color: #f0f0f0;
                text-transform: uppercase;
                font-weight: bold;
            }

            .col-date {
                width: 15%;
                text-align: left;
            }

            .col-day {
                width: 8%;
            }

            .col-dw {
                width: 6%;
            }

            tfoot td {
                font-weight: bold;
                text-align: center;
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

        <h2 class="title">{{ $company }}</h2>
        <h3 class="title">{{ $title }}</h3>
        <h3 class="title">{{ $employee }}</h3>
        <h4 class="title">{{ $period }}</h4>

        <table>
            <thead>
                <tr>
                    <th class="col-date">Date</th>
                    <th class="col-day">Day</th>
                    <th>IN</th>
                    <th>OUT</th>
                    <th>OT</th>
                    <th>HW</th>
                    <th>LATE</th>
                    <th>UT</th>
                    <th class="col-dw">DW</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($dtr_records as $record)
                    <tr>
                        <td class="col-date">{{ $record['DTRDate'] ?? '' }}</td>
                        <td class="col-day">{{ $record['Day'] ?? '' }}</td>
                        <td>{{ $record['IN'] ?? '' }}</td>
                        <td>{{ $record['OUT'] ?? '' }}</td>
                        <td>{{ $record['OT'] ?? '' }}</td>
                        <td>{{ $record['HW'] ?? '' }}</td>
                        <td>{{ $record['LATE'] ?? '' }}</td>
                        <td>{{ $record['UT'] ?? '' }}</td>
                        <td class="col-dw">{{ $record['DW'] ?? '' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

    </body>

</html>
