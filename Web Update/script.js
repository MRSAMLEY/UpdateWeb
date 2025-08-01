// Cart state management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Utility functions
function updateLocalStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function calculateCartTotal() {
  return cart.reduce((total, item) => {
    const price = parseFloat(item.price.replace('$', ''));
    return total + (price * item.quantity);
  }, 0);
}

function updateCartCount() {
  const cartCountElements = document.querySelectorAll('.cart-count');
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  cartCountElements.forEach(element => {
    element.textContent = totalItems > 0 ? totalItems : '';
    element.style.display = totalItems > 0 ? 'flex' : 'none';
  });
}

function showAddedToCartMessage(title) {
  const message = document.createElement('div');
  message.className = 'cart-message';
  message.innerHTML = `
    <span>${title} added to cart!</span>
    <a href="cart.html">View Cart</a>
  `;
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    message.classList.remove('show');
    setTimeout(() => message.remove(), 300);
  }, 3000);
}

// Initialize cart count on all pages
updateCartCount();

// Add to cart functionality
document.addEventListener('DOMContentLoaded', function() {
  // Add to cart buttons on product pages
  document.querySelectorAll('.book-card .btn-primary').forEach(button => {
    button.addEventListener('click', function() {
      const bookCard = this.closest('.book-card');
      const book = {
        id: bookCard.dataset.id || Date.now().toString(),
        title: bookCard.querySelector('.book-title').textContent,
        author: bookCard.querySelector('.book-author').textContent,
        price: bookCard.querySelector('.book-price').textContent,
        image: bookCard.querySelector('.book-cover').style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)[1],
        quantity: 1
      };
      
      // Check if item already exists in cart
      const existingItem = cart.find(item => item.id === book.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push(book);
      }
      
      updateLocalStorage();
      updateCartCount();
      showAddedToCartMessage(book.title);
    });
  });

  // Cart page functionality
  if (document.querySelector('.cart-items')) {
    renderCartItems();
    setupCartEventListeners();
  }
});

function renderCartItems() {
  const cartContainer = document.querySelector('.cart-items');
  const cartSummary = document.querySelector('.cart-summary');
  
  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <h3>Your cart is empty</h3>
        <a href="index.html" class="btn btn-primary">Browse Books</a>
      </div>
    `;
    cartSummary.style.display = 'none';
    return;
  }
  
  // Render cart items
  cartContainer.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-img" style="background-image: url('${item.image}')"></div>
      <div class="cart-item-details">
        <h3>${item.title}</h3>
        <p>${item.author}</p>
        <p class="item-price">${item.price}</p>
        <div class="quantity-controls">
          <button class="btn-quantity decrease" data-id="${item.id}">-</button>
          <span class="quantity">${item.quantity}</span>
          <button class="btn-quantity increase" data-id="${item.id}">+</button>
        </div>
        <button class="btn-remove" data-id="${item.id}">
          <i class="fas fa-trash"></i> Remove
        </button>
      </div>
    </div>
  `).join('');
  
  // Calculate and display total
  const total = calculateCartTotal();
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  document.querySelector('.cart-summary').innerHTML = `
    <h3>Order Summary</h3>
    <div class="summary-row">
      <span>Subtotal (${totalItems} items)</span>
      <span>$${total.toFixed(2)}</span>
    </div>
    <div class="summary-row">
      <span>Shipping</span>
      <span>FREE</span>
    </div>
    <div class="summary-row total">
      <span>Total</span>
      <span>$${total.toFixed(2)}</span>
    </div>
    <a href="payment.html" class="btn btn-primary" style="width: 100%; text-align: center;">
      Proceed to Checkout
    </a>
  `;
}

function setupCartEventListeners() {
  // Quantity increase
  document.querySelectorAll('.btn-quantity.increase').forEach(button => {
    button.addEventListener('click', function() {
      const itemId = this.dataset.id;
      const item = cart.find(item => item.id === itemId);
      if (item) {
        item.quantity += 1;
        updateLocalStorage();
        renderCartItems();
        setupCartEventListeners();
        updateCartCount();
      }
    });
  });

  // Quantity decrease
  document.querySelectorAll('.btn-quantity.decrease').forEach(button => {
    button.addEventListener('click', function() {
      const itemId = this.dataset.id;
      const item = cart.find(item => item.id === itemId);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          cart = cart.filter(item => item.id !== itemId);
        }
        updateLocalStorage();
        renderCartItems();
        setupCartEventListeners();
        updateCartCount();
      }
    });
  });

  // Remove item
  document.querySelectorAll('.btn-remove').forEach(button => {
    button.addEventListener('click', function() {
      const itemId = this.dataset.id;
      cart = cart.filter(item => item.id !== itemId);
      updateLocalStorage();
      renderCartItems();
      setupCartEventListeners();
      updateCartCount();
    });
  });
}