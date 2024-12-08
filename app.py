from flask import Flask, jsonify, request, render_template
import stripe
from products import PRODUCTS
from config import STRIPE_SECRET_KEY
from config import STRIPE_PUBLIC_KEY

app = Flask(__name__)

# Configuration des clés API Stripe (mode test)
stripe.api_key = STRIPE_SECRET_KEY

# Route principale pour afficher l'interface utilisateur
@app.route('/')
def index():
    return render_template('index.html')

# Route pour récupérer les produits
@app.route('/products')
def get_products():
    return jsonify(PRODUCTS)

@app.route('/stripe-public-key')
def get_stripe_public_key():
    return jsonify({'publicKey': STRIPE_PUBLIC_KEY})

# Route pour créer une session de paiement
@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.get_json()
        product = next((p for p in PRODUCTS if p['id'] == data['product_id']), None)
        if not product:
            return jsonify({"error": "Produit non trouvé"}), 404

        # Crée une session de paiement Stripe
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': product['name'],
                    },
                    'unit_amount': product['price'],
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url='http://127.0.0.1:5000/success',
            cancel_url='http://127.0.0.1:5000/cancel',
        )
        return jsonify({'id': session.id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route pour afficher la page de succès
@app.route('/success')
def success():
    return "Paiement réussi ! Merci pour votre achat."

# Route pour afficher la page d'annulation
@app.route('/cancel')
def cancel():
    return "Paiement annulé. Vous pouvez réessayer."

if __name__ == '__main__':
    app.run(debug=True)
