from flask import Flask, jsonify, request, render_template
import stripe
from products import PRODUCTS
from config import STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY

app = Flask(__name__)

# Configuration Stripe
stripe.api_key = STRIPE_SECRET_KEY

# Route principale pour afficher la page HTML
@app.route('/')
def index():
    return render_template('index.html')

# Route pour récupérer la liste des produits
@app.route('/products')
def get_products():
    return jsonify(PRODUCTS)

# Route pour récupérer la clé publique Stripe
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

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {'name': product['name']},
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

# Routes pour afficher le succès ou l'annulation
@app.route('/success')
def success():
    return "Paiement réussi ! Merci pour votre achat."

@app.route('/cancel')
def cancel():
    return "Paiement annulé. Vous pouvez réessayer."

if __name__ == '__main__':
    app.run(debug=True)
