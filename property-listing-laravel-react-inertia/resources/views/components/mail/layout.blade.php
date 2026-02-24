@props([
    'subject'  => config('app.name'),
    'preview'  => '',
])
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>{{ $subject }}</title>
    <!--[if mso]>
    <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
    <![endif]-->
    <style>
        /* Reset */
        *, *::before, *::after { box-sizing: border-box; }
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0; mso-table-rspace: 0; border-collapse: collapse; }
        img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }

        /* Base */
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 15px;
            line-height: 1.6;
            color: #18181b;
        }

        /* Wrapper */
        .email-wrapper {
            width: 100%;
            padding: 32px 16px;
        }

        /* Card */
        .email-card {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 4px rgba(0,0,0,.08);
        }

        /* Header */
        .email-header {
            background: #EE0088;
            padding: 28px 36px;
        }
        .email-header-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
        }
        .email-header-logo-mark {
            width: 32px;
            height: 32px;
            background: rgba(255,255,255,0.2);
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 800;
            color: #fff;
            letter-spacing: -0.5px;
            line-height: 1;
        }
        .email-header-brand {
            font-size: 15px;
            font-weight: 700;
            color: rgba(255,255,255,0.9);
            letter-spacing: 0.01em;
        }
        .email-header-title {
            margin: 0 0 4px;
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            line-height: 1.3;
        }
        .email-header-subtitle {
            margin: 0;
            font-size: 13px;
            color: rgba(255,255,255,0.8);
        }

        /* Body */
        .email-body {
            padding: 32px 36px;
        }

        /* Footer */
        .email-footer {
            padding: 20px 36px 28px;
            border-top: 1px solid #f0f0f0;
            text-align: center;
            font-size: 12px;
            color: #a1a1aa;
            line-height: 1.6;
        }
        .email-footer a {
            color: #EE0088;
            text-decoration: none;
        }

        /* Utilities */
        .field {
            margin-bottom: 20px;
        }
        .field-label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.07em;
            color: #71717a;
            margin-bottom: 5px;
        }
        .field-value {
            margin: 0;
            font-size: 15px;
            color: #18181b;
            font-weight: 500;
        }
        .field-value a {
            color: #EE0088;
            text-decoration: none;
        }
        .message-box {
            background: #fdf2f8;
            border-left: 3px solid #EE0088;
            border-radius: 0 6px 6px 0;
            padding: 16px 18px;
            margin-top: 4px;
            font-size: 15px;
            color: #3f3f46;
            line-height: 1.65;
            white-space: pre-wrap;
        }
        .badge {
            display: inline-block;
            background: #fce7f6;
            color: #be185d;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            padding: 3px 10px;
            border-radius: 9999px;
        }
        .divider {
            border: none;
            border-top: 1px solid #f4f4f5;
            margin: 24px 0;
        }
        .btn {
            display: inline-block;
            background: #EE0088;
            color: #ffffff !important;
            text-decoration: none;
            font-size: 14px;
            font-weight: 700;
            padding: 12px 28px;
            border-radius: 8px;
            letter-spacing: 0.01em;
        }
        .btn-wrapper {
            text-align: center;
            margin-top: 28px;
        }

        @media only screen and (max-width: 620px) {
            .email-header, .email-body, .email-footer { padding-left: 20px; padding-right: 20px; }
            .email-header-title { font-size: 19px; }
        }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="email-card">

        {{-- Header --}}
        <div class="email-header">
            <div class="email-header-logo">
                <span class="email-header-logo-mark">D</span>
                <span class="email-header-brand">DCH Properties</span>
            </div>
            {{ $header ?? '' }}
        </div>

        {{-- Body --}}
        <div class="email-body">
            {{ $slot }}
        </div>

        {{-- Footer --}}
        <div class="email-footer">
            &copy; {{ date('Y') }} DCH Properties &mdash;
            <a href="{{ config('app.url') }}">{{ parse_url(config('app.url'), PHP_URL_HOST) }}</a><br>
            You received this email because someone submitted an enquiry on your property listing.
        </div>

    </div>
</div>
</body>
</html>
