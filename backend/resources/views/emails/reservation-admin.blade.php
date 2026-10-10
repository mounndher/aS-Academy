```blade
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle réservation - AS Academy</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial,Helvetica,sans-serif; color:#333333;">

    <div style="max-width:650px; margin:30px auto; background:#ffffff; border-radius:10px; overflow:hidden; border:1px solid #e5e5e5;">

        <!-- Header -->
        <div style="background:#171717; padding:25px 30px; text-align:center;">
            <h1 style="margin:0; color:#ffffff; font-size:25px;">
                AS Academy
            </h1>
            <p style="margin:8px 0 0; color:#d1d1d1; font-size:14px;">
                Notification de réservation
            </p>
        </div>

        <!-- Main content -->
        <div style="padding:30px;">

            <h2 style="margin-top:0; color:#222222; font-size:22px;">
                Nouvelle réservation reçue !
            </h2>

            <p style="font-size:15px; line-height:1.7;">
                Bonjour,
            </p>

            <p style="font-size:15px; line-height:1.7;">
                Une nouvelle demande de réservation vient d'être envoyée
                sur votre site AS Academy.
            </p>

            <!-- Reservation reference -->
            <div style="background:#f5f5f5; border-left:4px solid #c9a96a; padding:15px 18px; margin:25px 0;">
                <p style="margin:0 0 5px; font-size:13px; color:#666666;">
                    Référence de réservation
                </p>
                <p style="margin:0; font-size:21px; font-weight:bold; color:#171717;">
                    {{ $reservation->reference }}
                </p>
            </div>

            <!-- Formation -->
            <h3 style="color:#171717; border-bottom:1px solid #eeeeee; padding-bottom:10px;">
                Informations sur la formation
            </h3>

            <table style="width:100%; border-collapse:collapse; font-size:14px;">
                <tr>
                    <td style="padding:10px 0; color:#666666; width:40%;">Formation</td>
                    <td style="padding:10px 0; font-weight:bold;">
                        {{ $reservation->formation?->title ?? 'Non renseignée' }}
                    </td>
                </tr>
                <tr>
                    <td style="padding:10px 0; color:#666666;">Ville</td>
                    <td style="padding:10px 0;">
                        {{ $reservation->formationDay?->city ?? 'Non renseignée' }}
                    </td>
                </tr>
                <tr>
                    <td style="padding:10px 0; color:#666666;">Date de début</td>
                    <td style="padding:10px 0;">
                        {{ $reservation->formationDay?->start_date ?? 'Non renseignée' }}
                    </td>
                </tr>
                <tr>
                    <td style="padding:10px 0; color:#666666;">Date de fin</td>
                    <td style="padding:10px 0;">
                        {{ $reservation->formationDay?->end_date ?? 'Non renseignée' }}
                    </td>
                </tr>
            </table>

            <!-- Customer -->
            <h3 style="color:#171717; border-bottom:1px solid #eeeeee; padding-bottom:10px; margin-top:30px;">
                Informations du client
            </h3>

            <table style="width:100%; border-collapse:collapse; font-size:14px;">
                <tr>
                    <td style="padding:10px 0; color:#666666; width:40%;">Nom complet</td>
                    <td style="padding:10px 0; font-weight:bold;">
                        {{ $reservation->customer?->first_name }}
                        {{ $reservation->customer?->last_name }}
                    </td>
                </tr>
                <tr>
                    <td style="padding:10px 0; color:#666666;">E-mail</td>
                    <td style="padding:10px 0;">
                        {{ $reservation->customer?->email ?? 'Non renseigné' }}
                    </td>
                </tr>
                <tr>
                    <td style="padding:10px 0; color:#666666;">Téléphone</td>
                    <td style="padding:10px 0;">
                        {{ $reservation->customer?->phone ?? 'Non renseigné' }}
                    </td>
                </tr>
            </table>

            <!-- Payment -->
            <h3 style="color:#171717; border-bottom:1px solid #eeeeee; padding-bottom:10px; margin-top:30px;">
                Informations de paiement
            </h3>

            <table style="width:100%; border-collapse:collapse; font-size:14px;">
                <tr>
                    <td style="padding:10px 0; color:#666666; width:40%;">Prix total</td>
                    <td style="padding:10px 0; font-weight:bold;">
                        {{ number_format((float) $reservation->sold_price, 2, ',', ' ') }} €
                    </td>
                </tr>
                <tr>
                    <td style="padding:10px 0; color:#666666;">Acompte demandé</td>
                    <td style="padding:10px 0;">
                        {{ number_format((float) $reservation->deposit_amount, 2, ',', ' ') }} €
                    </td>
                </tr>
                <tr>
                    <td style="padding:10px 0; color:#666666;">Mode de tarification</td>
                    <td style="padding:10px 0;">
                        {{ strtoupper($reservation->pricing_type ?? 'normal') }}
                    </td>
                </tr>
                <tr>
                    <td style="padding:10px 0; color:#666666;">Nombre de paiements</td>
                    <td style="padding:10px 0;">
                        {{ $reservation->payment_installments ?? 1 }}
                    </td>
                </tr>
                <tr>
                    <td style="padding:10px 0; color:#666666;">Statut</td>
                    <td style="padding:10px 0;">
                        {{ ucfirst($reservation->status ?? 'pending') }}
                    </td>
                </tr>
            </table>

            <!-- Customer message -->
            @if($reservation->notes)
                <h3 style="color:#171717; border-bottom:1px solid #eeeeee; padding-bottom:10px; margin-top:30px;">
                    Message du client
                </h3>

                <div style="background:#f8f8f8; padding:15px; border-radius:5px; font-size:14px; line-height:1.7;">
                    {{ $reservation->notes }}
                </div>
            @endif

            <p style="margin-top:30px; font-size:14px; line-height:1.7;">
                Veuillez consulter votre espace d'administration pour vérifier
                la réservation et son paiement.
            </p>

        </div>

        <!-- Footer -->
        <div style="background:#f5f5f5; padding:20px 30px; text-align:center;">
            <p style="margin:0; color:#777777; font-size:12px; line-height:1.6;">
                Cet e-mail a été envoyé automatiquement par AS Academy.<br>
                Merci de ne pas répondre directement à ce message.
            </p>
        </div>

    </div>

</body>
</html>
```