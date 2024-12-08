from flask import Flask, jsonify, request, render_template
import stripe

# Configuration de l'application Flask
app = Flask(__name__)

# Configuration des clés API Stripe (mode test)
stripe.api_key = "sk_test_votre_cle_secrete"  # Remplacez par votre clé secrète de test

# Données statiques pour les produits (simulées dans le backend)
PRODUCTS = [
    {"id": 1, "name": "Produit 1", "price": 2300},  # Prix en centimes
    {"id": 2, "name": "Produit 2", "price": 4800}   # Prix en centimes
]

# Route pour le frontend (page principale)
@app.route('/')
def index():
    return render_template('index.html')

# Route pour récupérer les produits
@app.route('/products')
def get_products():
    return jsonify(PRODUCTS)

# Route pour créer une session de paiement Stripe
@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    data = request.get_json()
    product = next((p for p in PRODUCTS if p['name'] == data['name']), None)

    if not product:
        return jsonify({'error': 'Produit non trouvé'}), 404

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'eur',
                        'product_data': {
                            'name': product['name'],
                        },
                        'unit_amount': product['price'],
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url='http://127.0.0.1:5000/success',
            cancel_url='http://127.0.0.1:5000/cancel',
        )
        return jsonify({'id': checkout_session.id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Routes pour les pages de succès et d'annulation
@app.route('/success')
def success():
    return "<h1>Paiement réussi ! Merci pour votre achat.</h1>"

@app.route('/cancel')
def cancel():
    return "<h1>Paiement annulé. Vous pouvez réessayer.</h1>"

# Point d'entrée principal
if __name__ == '__main__':
    print("Démarrage du serveur Flask...")
    app.run(debug=True)
