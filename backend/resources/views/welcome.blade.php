<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Test Réservation</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 40px;
            font-family: Arial, sans-serif;
            background: #f7f5f1;
            color: #171717;
        }

        .container {
            max-width: 700px;
            margin: auto;
            padding: 40px;
            background: white;
            border: 1px solid #ddd;
        }

        h1 {
            margin-top: 0;
            font-size: 36px;
            font-weight: 400;
        }

        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }

        .field {
            margin-bottom: 18px;
        }

        label {
            display: block;
            margin-bottom: 7px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: .12em;
        }

        input,
        textarea,
        select {
            width: 100%;
            padding: 12px;
            border: 1px solid #ccc;
            font-size: 15px;
            background: #fff;
        }

        textarea {
            min-height: 100px;
            resize: vertical;
        }

        .options {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }

        .option {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 15px;
            border: 1px solid #ddd;
            cursor: pointer;
            background: #fafafa;
        }

        .option input {
            width: auto;
            margin: 0;
        }

        .help {
            margin-top: 7px;
            font-size: 12px;
            color: #777;
        }

        button {
            width: 100%;
            padding: 15px;
            border: 0;
            background: #111;
            color: white;
            cursor: pointer;
            font-size: 14px;
            letter-spacing: .08em;
        }

        button:hover {
            background: #333;
        }

        .file {
            padding: 15px;
            border: 1px dashed #bbb;
            background: #fafafa;
        }

        .info {
            padding: 15px;
            margin-bottom: 25px;
            background: #f8f8f8;
            border-left: 3px solid #111;
            font-size: 13px;
            line-height: 1.6;
        }
    </style>
</head>

<body>

<div class="container">

    <h1>Réserver ma place</h1>

    <p class="subtitle">
        Test du formulaire de réservation
    </p>

    <div class="info">
        <strong>Session test :</strong><br>
        Formation ID : 1<br>
        Formation Day ID : 1<br>
        Prix normal : 850 €<br>
        Prix CPF : 1500 €
    </div>

    <form
        action="{{ url('/api/reservations') }}"
        method="POST"
        enctype="multipart/form-data"
    >

        {{-- FORMATION --}}
        <div class="field">
            <label for="formation_id">Formation ID</label>

            <input
                type="number"
                id="formation_id"
                name="formation_id"
                value="1"
                required
            >
        </div>

        {{-- FORMATION DAY --}}
        <div class="field">
            <label for="formation_day_id">Formation Day ID</label>

            <input
                type="number"
                id="formation_day_id"
                name="formation_day_id"
                value="1"
                required
            >
        </div>

        {{-- PRICING TYPE --}}
        <div class="field">
            <label>Type de tarif</label>

            <div class="options">

                <label class="option">
                    <input
                        type="radio"
                        name="pricing_type"
                        value="normal"
                        checked
                    >
                    <span>Tarif normal</span>
                </label>

                <label class="option">
                    <input
                        type="radio"
                        name="pricing_type"
                        value="cpf"
                    >
                    <span>Tarif CPF</span>
                </label>

            </div>

            <div class="help">
                Valeurs autorisées : normal ou cpf
            </div>
        </div>

        {{-- PAYMENT INSTALLMENTS --}}
        <div class="field">
            <label for="payment_installments">
                Nombre de paiements
            </label>

            <select
                id="payment_installments"
                name="payment_installments"
                required
            >
                <option value="1">
                    1 paiement — paiement complet
                </option>

                <option value="2" selected>
                    2 paiements — acompte + solde
                </option>
            </select>

            <div class="help">
                Maximum : 2 paiements.
            </div>
        </div>

        {{-- FIRST NAME --}}
        <div class="field">
            <label for="first_name">Prénom</label>

            <input
                type="text"
                id="first_name"
                name="first_name"
                value="Ahmed"
                required
            >
        </div>

        {{-- LAST NAME --}}
        <div class="field">
            <label for="last_name">Nom</label>

            <input
                type="text"
                id="last_name"
                name="last_name"
                value="Benali"
                required
            >
        </div>

        {{-- EMAIL --}}
        <div class="field">
            <label for="email">Email</label>

            <input
                type="email"
                id="email"
                name="email"
                value="ahmed@gmail.com"
                required
            >
        </div>

        {{-- PHONE --}}
        <div class="field">
            <label for="phone">Téléphone</label>

            <input
                type="text"
                id="phone"
                name="phone"
                value="0612345678"
                required
            >
        </div>

        {{-- ADDRESS --}}
        <div class="field">
            <label for="address">Adresse</label>

            <input
                type="text"
                id="address"
                name="address"
                value="10 Rue Paris"
                required
            >
        </div>

        {{-- POSTAL CODE --}}
        <div class="field">
            <label for="postal_code">Code postal</label>

            <input
                type="text"
                id="postal_code"
                name="postal_code"
                value="75000"
                required
            >
        </div>

        {{-- CITY --}}
        <div class="field">
            <label for="city">Ville</label>

            <input
                type="text"
                id="city"
                name="city"
                value="Paris"
                required
            >
        </div>

        {{-- MESSAGE --}}
        <div class="field">
            <label for="message">Message</label>

            <textarea
                id="message"
                name="message"
            >Je souhaite réserver cette session</textarea>
        </div>

        {{-- PAYMENT PROOF --}}
        <div class="field">
            <label for="payment_proof">
                Preuve de paiement
            </label>

            <div class="file">
                <input
                    type="file"
                    id="payment_proof"
                    name="payment_proof"
                    accept=".jpg,.jpeg,.png,.webp"
                >
            </div>

            <div class="help">
                Formats acceptés : JPG, JPEG, PNG, WEBP
            </div>
        </div>

        {{-- SUBMIT --}}
        <button type="submit">
            TESTER LA RÉSERVATION
        </button>

    </form>

</div>

</body>
</html>