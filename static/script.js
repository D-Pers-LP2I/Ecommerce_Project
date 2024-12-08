// Ce fichier gère les interactions dynamiques du frontend : récupération des produits, affichage et gestion des paiements.
let products = [], stripePublicKey = '';

// Récupère la clé publique Stripe
const fetchStripePublicKey = async () => {
    try {
        const res = await fetch('/stripe-public-key');
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        stripePublicKey = (await res.json()).publicKey;
    } catch (err) {
        console.error('Erreur clé publique Stripe :', err);
    }
};

// Récupère les produits
const fetchProducts = async () => {
    try {
        const res = await fetch('/products');
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        products = await res.json();
        displayProducts(products);
    } catch (err) {
        console.error('Erreur produits :', err);
        document.getElementById('product-list').textContent = 'Impossible de charger les produits.';
    }
};

// Affiche les produits
const displayProducts = products => {
    const productList = document.getElementById('product-list');
    productList.innerHTML = products.map(p => `
        <div class="product">
            <h2>${p.name}</h2>
            <p>${(p.price / 100).toFixed(2)} €</p>
            <button onclick="buyProduct(${p.id})">Acheter</button>
        </div>`).join('');
};

// Achète un produit
const buyProduct = async productId => {
    try {
        const res = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId })
        });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const session = await res.json();
        Stripe(stripePublicKey).redirectToCheckout({ sessionId: session.id });
    } catch (err) {
        console.error('Erreur achat produit :', err);
    }
};

// Chargement initial
document.addEventListener('DOMContentLoaded', async () => {
    await fetchStripePublicKey();
    await fetchProducts();
});
