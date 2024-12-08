import stripe

# Ajoutez votre clé secrète ici (uniquement pour le test rapide)
stripe.api_key = "sk_test_51QTKu0RrBe4LM0Cs4Rv4cCGvivGtfjNWocCC0sRQtv3j5ZE3SMFtpbK0lDnNAMDCPhgqngmMy7I7VdcFpidPFxPY00PpnjmySw"  # Votre clé secrète de test

try:
    # Testez une requête simple à Stripe
    balance = stripe.Balance.retrieve()
    print("Connexion réussie à Stripe !")
    print(balance)
except Exception as e:
    print(f"Erreur Stripe : {e}")
