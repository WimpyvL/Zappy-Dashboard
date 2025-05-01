import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from './CartContext';

// Create a test component that uses the cart context
const TestComponent = () => {
  const {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  } = useCart();

  // Sample products
  const medication = {
    id: 'med1',
    name: 'Test Medication',
    type: 'medication',
    oneTimePurchasePrice: 10.99,
    stripeOneTimePriceId: 'price_med1_onetime',
  };

  const supplement = {
    id: 'supp1',
    name: 'Test Supplement',
    type: 'supplement',
    price: 15.99,
    allowOneTimePurchase: true,
    stripePriceId: 'price_supp1',
  };

  // Sample doses
  const smallDose = {
    id: 'dose1',
    value: '10mg',
    allowOneTimePurchase: true,
    stripePriceId: 'price_dose1_sub',
  };

  const largeDose = {
    id: 'dose2',
    value: '20mg',
    allowOneTimePurchase: true,
    stripePriceId: 'price_dose2_sub',
  };

  const nonPurchasableDose = {
    id: 'dose3',
    value: '30mg',
    allowOneTimePurchase: false,
    stripePriceId: 'price_dose3_sub',
  };

  return (
    <div>
      <div data-testid="cart-count">{getCartItemCount()}</div>
      <div data-testid="cart-total">${getCartTotal().toFixed(2)}</div>
      
      <ul>
        {cartItems.map((item) => (
          <li key={item.doseId} data-testid={`cart-item-${item.doseId}`}>
            {item.productName} {item.doseValue} - ${item.price} x {item.quantity}
            <button onClick={() => removeItem(item.doseId)}>Remove</button>
            <button onClick={() => updateQuantity(item.doseId, item.quantity + 1)}>
              Increase
            </button>
            <button onClick={() => updateQuantity(item.doseId, item.quantity - 1)}>
              Decrease
            </button>
          </li>
        ))}
      </ul>
      
      <button onClick={() => addItem(medication, smallDose, 1)}>
        Add Small Medication
      </button>
      <button onClick={() => addItem(medication, largeDose, 2)}>
        Add Large Medication
      </button>
      <button onClick={() => addItem(medication, nonPurchasableDose, 1)}>
        Add Non-Purchasable Medication
      </button>
      <button onClick={() => addItem(supplement, { id: 'supp-dose' }, 1)}>
        Add Supplement
      </button>
      <button onClick={() => clearCart()}>Clear Cart</button>
    </div>
  );
};

describe('CartContext', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    localStorage.clear();
    jest.clearAllMocks();
    
    // Mock console.warn to suppress warnings
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    console.warn.mockRestore();
  });

  test('initializes with empty cart when no saved data exists', () => {
    localStorage.getItem.mockReturnValueOnce(null);
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('$0.00');
  });

  test('initializes with saved cart data from localStorage', () => {
    const savedCart = [
      {
        productId: 'med1',
        productName: 'Saved Medication',
        doseId: 'saved-dose',
        doseValue: '5mg',
        price: 9.99,
        quantity: 2,
        type: 'medication',
      },
    ];
    
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(savedCart));
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('$19.98');
    expect(screen.getByTestId('cart-item-saved-dose')).toBeInTheDocument();
  });

  test('adds a new medication item to the cart', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    // Initial cart should be empty
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    
    // Add a medication with small dose
    await user.click(screen.getByText('Add Small Medication'));
    
    // Cart should now have one item
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('$10.99');
    expect(screen.getByTestId('cart-item-dose1')).toBeInTheDocument();
    
    // Verify localStorage was updated
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'shoppingCart',
      expect.any(String)
    );
    const savedCart = JSON.parse(localStorage.setItem.mock.calls[0][1]);
    expect(savedCart).toHaveLength(1);
    expect(savedCart[0].productId).toBe('med1');
    expect(savedCart[0].doseId).toBe('dose1');
  });

  test('adds a supplement item to the cart', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    // Add a supplement
    await user.click(screen.getByText('Add Supplement'));
    
    // Cart should now have one item
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('$15.99');
    expect(screen.getByTestId('cart-item-supp-dose')).toBeInTheDocument();
  });

  test('does not add non-purchasable items to the cart', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    // Try to add a non-purchasable item
    await user.click(screen.getByText('Add Non-Purchasable Medication'));
    
    // Cart should still be empty
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('$0.00');
    
    // Verify warning was logged
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('is not available for one-time purchase')
    );
  });

  test('updates quantity when adding an existing item', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    // Add a medication with small dose
    await user.click(screen.getByText('Add Small Medication'));
    
    // Add the same item again
    await user.click(screen.getByText('Add Small Medication'));
    
    // Cart should have one item with quantity 2
    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('$21.98');
    expect(screen.getByTestId('cart-item-dose1')).toHaveTextContent('x 2');
  });

  test('removes an item from the cart', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    // Add a medication
    await user.click(screen.getByText('Add Small Medication'));
    
    // Verify it was added
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    
    // Remove the item
    await user.click(screen.getByText('Remove'));
    
    // Cart should be empty again
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('$0.00');
    expect(screen.queryByTestId('cart-item-dose1')).not.toBeInTheDocument();
  });

  test('increases item quantity', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    // Add a medication
    await user.click(screen.getByText('Add Small Medication'));
    
    // Increase quantity
    await user.click(screen.getByText('Increase'));
    
    // Cart should have one item with quantity 2
    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('$21.98');
    expect(screen.getByTestId('cart-item-dose1')).toHaveTextContent('x 2');
  });

  test('decreases item quantity', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    // Add a medication with quantity 2
    await user.click(screen.getByText('Add Large Medication'));
    
    // Verify it was added with quantity 2
    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
    
    // Decrease quantity
    await user.click(screen.getByText('Decrease'));
    
    // Cart should have one item with quantity 1
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    expect(screen.getByTestId('cart-item-dose2')).toHaveTextContent('x 1');
  });

  test('removes item when quantity reaches 0', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    // Add a medication
    await user.click(screen.getByText('Add Small Medication'));
    
    // Decrease quantity below 1
    await user.click(screen.getByText('Decrease'));
    
    // Cart should be empty
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.queryByTestId('cart-item-dose1')).not.toBeInTheDocument();
  });

  test('does not allow quantity to go below 1 when updating', async () => {
    const user = userEvent.setup();
    
    // Set up a mock setItems function to check attempted values
    const setItemsSpy = jest.fn();
    jest.spyOn(React, 'useState').mockImplementation((initialValue) => {
      if (Array.isArray(initialValue) || initialValue === undefined) {
        return [[
          {
            productId: 'med1',
            productName: 'Test Medication',
            doseId: 'dose1',
            doseValue: '10mg',
            price: 10.99,
            quantity: 1,
            type: 'medication',
          }
        ], setItemsSpy];
      }
      return React.useState(initialValue);
    });
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    // Try to decrease quantity below 1
    await user.click(screen.getByText('Decrease'));
    
    // Verify that the setter function was called with a filtered array
    // that doesn't include the item (since quantity would be 0)
    expect(setItemsSpy).toHaveBeenCalledWith(expect.any(Function));
    const setterFn = setItemsSpy.mock.calls[0][0];
    const result = setterFn([
      {
        productId: 'med1',
        productName: 'Test Medication',
        doseId: 'dose1',
        doseValue: '10mg',
        price: 10.99,
        quantity: 1,
        type: 'medication',
      }
    ]);
    expect(result).toEqual([]);
    
    // Restore useState
    React.useState.mockRestore();
  });

  test('clears all items from the cart', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    // Add multiple items
    await user.click(screen.getByText('Add Small Medication'));
    await user.click(screen.getByText('Add Large Medication'));
    await user.click(screen.getByText('Add Supplement'));
    
    // Verify items were added
    expect(screen.getByTestId('cart-count')).toHaveTextContent('4'); // 1 + 2 + 1 = 4
    
    // Clear the cart
    await user.click(screen.getByText('Clear Cart'));
    
    // Cart should be empty
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('$0.00');
    expect(screen.queryByTestId('cart-item-dose1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-item-dose2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-item-supp-dose')).not.toBeInTheDocument();
  });

  test('calculates correct cart total with multiple items', async () => {
    const user = userEvent.setup();
    
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    // Add multiple items
    await user.click(screen.getByText('Add Small Medication')); // 1 x $10.99 = $10.99
    await user.click(screen.getByText('Add Large Medication')); // 2 x $10.99 = $21.98
    await user.click(screen.getByText('Add Supplement')); // 1 x $15.99 = $15.99
    
    // Total should be $10.99 + $21.98 + $15.99 = $48.96
    expect(screen.getByTestId('cart-total')).toHaveTextContent('$48.96');
  });
});