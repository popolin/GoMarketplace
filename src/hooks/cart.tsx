import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const currentCarS = await AsyncStorage.getItem('@GoMarketplace:car');
      if (!currentCarS) {
        AsyncStorage.setItem('@GoMarketplace:car', JSON.stringify([]));
        setProducts([]);
      } else {
        setProducts(JSON.parse(currentCarS));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const existsProduct = products.find(prod => prod.id === product.id);
      if (existsProduct) {
        existsProduct.quantity += 1;
      } else {
        const newCar = [...products, { ...product, quantity: 1 }];
        setProducts(newCar);
        await AsyncStorage.setItem(
          '@GoMarketplace:car',
          JSON.stringify(newCar),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productToIncrement = products.find(product => product.id === id);
      if (productToIncrement) {
        productToIncrement.quantity += 1;
        const others = products.filter(prod => prod.id !== id);
        const newCar = [...others, productToIncrement];
        setProducts(newCar);
        await AsyncStorage.setItem(
          '@GoMarketplace:car',
          JSON.stringify(newCar),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productToDecrement = products.find(product => product.id === id);
      if (productToDecrement) {
        if (productToDecrement.quantity === 1) {
          const newProducts = products.filter(procuct => procuct.id !== id);
          setProducts(newProducts);
          await AsyncStorage.setItem(
            '@GoMarketplace:car',
            JSON.stringify(newProducts),
          );
        } else {
          productToDecrement.quantity -= 1;
          const others = products.filter(prod => prod.id !== id);
          const newCar = [...others, productToDecrement];
          setProducts(newCar);
          await AsyncStorage.setItem(
            '@GoMarketplace:car',
            JSON.stringify(newCar),
          );
        }
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
