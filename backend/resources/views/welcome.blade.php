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
        textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #ccc;
            font-size: 15px;
        }

        textarea {
            min-height: 100px;
        }

        button {
            width: 100%;
            padding: 15px;
            border: 0;
            background: #111;
            color: white;
            cursor: pointer;
        }

        button:hover {
            background: #333;
        }

        .file {
            padding: 15px;
            border: 1px dashed #bbb;
            background: #fafafa;
        }
    </style>
</head>

<body>

<div class="container">

    <h1>Réserver ma place</h1>

    <p>Test du formulaire de réservation</p>

    <form
        action="{{ url('/api/reservations') }}"
        method="POST"
        enctype="multipart/form-data"
    >

        <div class="field">
            <label>Formation ID</label>
            <input
                type="number"
                name="formation_id"
                value="1"
                required
            >
        </div>

        <div class="field">
            <label>Formation Day ID</label>
            <input
                type="number"
                name="formation_day_id"
                value="1"
                required
            >
        </div>

        <div class="field">
            <label>Prénom</label>
            <input
                type="text"
                name="first_name"
                value="Ahmed"
                required
            >
        </div>

        <div class="field">
            <label>Nom</label>
            <input
                type="text"
                name="last_name"
                value="Benali"
                required
            >
        </div>

        <div class="field">
            <label>Email</label>
            <input
                type="email"
                name="email"
                value="ahmed@gmail.com"
                required
            >
        </div>

        <div class="field">
            <label>Téléphone</label>
            <input
                type="text"
                name="phone"
                value="0612345678"
                required
            >
        </div>

        <div class="field">
            <label>Adresse</label>
            <input
                type="text"
                name="address"
                value="10 Rue Paris"
                required
            >
        </div>

        <div class="field">
            <label>Code postal</label>
            <input
                type="text"
                name="postal_code"
                value="75000"
                required
            >
        </div>

        <div class="field">
            <label>Ville</label>
            <input
                type="text"
                name="city"
                value="Paris"
                required
            >
        </div>

        <div class="field">
            <label>Message</label>
            <textarea name="message">Je souhaite réserver cette session</textarea>
        </div>

        <div class="field">
            <label>Preuve de paiement</label>

            <div class="file">
                <input
                    type="file"
                    name="payment_proof"
                    accept=".jpg,.jpeg,.png,.webp"
                >
            </div>
        </div>

        <button type="submit">
            TESTER LA RÉSERVATION
        </button>

    </form>

</div>

</body>
</html>