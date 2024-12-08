// Liste des produits récupérée depuis l'API backend
let products = [];

// Fonction pour récupérer les produits depuis le backend
function fetchProducts() {
    fetch('http://127.0.0.1:5000/products') // URL de l'API backend
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }
            return response.json(); // Convertit la réponse en JSON
        })
        .then(data => {
            products = data; // Stocke les produits récupérés
            displayProducts(products); // Affiche les produits
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des produits :', error);
            const productList = document.getElementById('product-list');
            productList.innerHTML = '<p>Impossible de charger les produits. Veuillez réessayer plus tard.</p>';
        });
}

// Fonction pour afficher les produits dans le DOM
function displayProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; // Vide le contenu précédent

    products.forEach(product => {
        // Crée une carte pour chaque produit
        const productDiv = document.createElement('div');
        productDiv.className = 'product';

        productDiv.innerHTML = `
            <h2>${product.name}</h2>
            <p>${(product.price / 100).toFixed(2)} €</p>
            <button onclick="buyProduct(${product.id})">Acheter</button>
        `;
        productList.appendChild(productDiv); // Ajoute la carte au conteneur
    });
}

// Fonction pour gérer l'achat d'un produit
function buyProduct(productId) {
    const product = products.find(p => p.id === productId); // Trouve le produit sélectionné
    if (!product) {
        console.error(`Produit avec l'ID ${productId} introuvable.`);
        return;
    }

    // Appel au backend pour créer une session Stripe
    fetch('/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: product.name,
            price: product.price,
        }),
    })
        .then(response => response.json())
        .then(session => {
            if (session.error) {
                console.error('Erreur Stripe :', session.error);
                alert('Une erreur est survenue lors de la création de la session de paiement.');
                return;
            }
            // Redirige l'utilisateur vers Stripe Checkout
            const stripe = Stripe('pk_test_votre_cle_publique'); // Remplacez par votre clé publique
            stripe.redirectToCheckout({ sessionId: session.id });
        })
        .catch(error => console.error('Erreur lors de la création de la session de paiement :', error));
}

// Rendre buyProduct globalement accessible
window.buyProduct = buyProduct;

// Charger les produits lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts(); // Appelle la fonction pour récupérer et afficher les produits
});
