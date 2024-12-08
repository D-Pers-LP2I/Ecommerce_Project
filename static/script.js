// Variables globales
let products = [];
let stripePublicKey = '';

// Fonction pour récupérer la clé publique Stripe
async function fetchStripePublicKey() {
    try {
        const response = await fetch('/stripe-public-key');
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
        const data = await response.json();
        stripePublicKey = data.publicKey;
    } catch (error) {
        console.error('Erreur lors de la récupération de la clé publique Stripe :', error);
    }
}

// Fonction pour récupérer les produits
async function fetchProducts() {
    try {
        const response = await fetch('/products');
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Erreur lors de la récupération des produits :', error);
        document.getElementById('product-list').textContent = 'Impossible de charger les produits.';
    }
}

// Fonction pour afficher les produits dans la page
function displayProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.innerHTML = `
            <h2>${product.name}</h2>
            <p>${(product.price / 100).toFixed(2)} €</p>
            <button onclick="buyProduct(${product.id})">Acheter</button>
        `;
        productList.appendChild(productDiv);
    });
}

// Fonction pour gérer l'achat d'un produit
async function buyProduct(productId) {
    try {
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId }),
        });
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
        const session = await response.json();
        const stripe = Stripe(stripePublicKey);
        stripe.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
        console.error('Erreur lors de l\'achat du produit :', error);
    }
}

// Chargement initial
document.addEventListener('DOMContentLoaded', async () => {
    await fetchStripePublicKey();
    await fetchProducts();
});